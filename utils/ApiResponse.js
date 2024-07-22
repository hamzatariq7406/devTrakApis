
export default class ApiResponse {
    static result = (res, data, status) => {
      res.status(status);
      res.json({
        data: data,
        success: true,
      });
    };
  }
  