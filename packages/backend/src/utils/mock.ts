import { type Mock, mock as mockNode } from "node:test";
import type { Mock as MockVitest } from "vitest";

// Adapted from https://github.com/eratio08/vitest-mock-extended/blob/main/src/Mock.ts

type MatcherFn<T> = (actualValue: T) => boolean;

class Matcher<T> {
  $$typeof: symbol;
  inverse?: boolean;

  constructor(
    readonly asymmetricMatch: MatcherFn<T>,
    private readonly description: string,
  ) {
    this.$$typeof = Symbol.for("vi.asymmetricMatcher");
  }

  toString() {
    return this.description;
  }

  toAsymmetricMatcher() {
    return this.description;
  }

  getExpectedType() {
    return "undefined";
  }
}

type MatchersOrLiterals<Y extends unknown[]> = { [K in keyof Y]: Matcher<Y[K]> | Y[K] };

type CalledWithMock<T, Y extends unknown[]> = {
  calledWith: (...args: Y | MatchersOrLiterals<Y>) => MockVitest<Y, T>;
} & MockVitest<Y, T>;

type _MockProxy<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer B ? T[K] & CalledWithMock<B, A> : T[K];
};

type MockProxyVitest<T> = _MockProxy<T> & T;

export const mockVi = <T>(params?: Partial<T>): MockProxyVitest<T> & T => {
  const mocks: Record<string | symbol, MockVitest> = {};

  return new Proxy(params ?? {}, {
    ownKeys(target: MockProxyVitest<unknown>) {
      return Reflect.ownKeys(target);
    },
    get: (target, property) => {
      if (property in target) {
        return target[property as keyof typeof target];
      }
      if (mocks[property] == null) {
        mocks[property] = vi.fn();
      }

      return mocks[property];
    },
  }) as MockProxyVitest<T> & T;
};

type MockProxy<T> = {
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  [K in keyof T]: T[K] extends Function ? T[K] & Mock<T[K]> : T[K];
};

export const mock = <T>(params?: Partial<T>): MockProxy<T> & T => {
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  const mocks: Record<string | symbol, Mock<Function>> = {};

  return new Proxy(params ?? {}, {
    ownKeys(target: MockProxy<T>) {
      return Reflect.ownKeys(target);
    },
    get: (target, property) => {
      if (property in target) {
        return target[property as keyof typeof target];
      }
      if (mocks[property] == null) {
        mocks[property] = mockNode.fn();
      }

      return mocks[property];
    },
  }) as MockProxy<T> & T;
};
