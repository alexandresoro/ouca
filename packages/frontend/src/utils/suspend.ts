interface Response<T> {
  status: "success" | "pending" | "error";
  data: T | null;
}

/**
 * A promise tracker that will be updated
 * when promise resolves or rejects
 */
const response: Response<unknown> = {
  status: "pending",
  data: null,
};

const suspend = <T>(fn: () => Promise<T>) => {
  const suspender = fn().then(
    (res) => {
      response.status = "success";
      response.data = res;
    },
    (error) => {
      response.status = "error";
      response.data = error;
    }
  );

  switch (response.status) {
    case "pending":
      throw suspender;
    case "error":
      throw response.data as T;
    default:
      return response.data as T;
  }
};

export default suspend;
