import { type Mock } from "vitest";

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
  calledWith: (...args: Y | MatchersOrLiterals<Y>) => Mock<Y, T>;
} & Mock<Y, T>;

type _MockProxy<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer B ? T[K] & CalledWithMock<B, A> : T[K];
};

type MockProxy<T> = _MockProxy<T> & T;

export const mockVi = <T>(params?: Partial<T>): MockProxy<T> & T => {
  const mocks: Record<string | symbol, Mock> = {};

  return new Proxy(params ?? {}, {
    ownKeys(target: MockProxy<unknown>) {
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
  }) as MockProxy<T> & T;
};
