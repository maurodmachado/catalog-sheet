const valuesMock = {
  get: jest.fn().mockResolvedValue({ data: { values: [] } }),
  append: jest.fn().mockResolvedValue({ data: { values: [] } }),
  update: jest.fn().mockResolvedValue({ data: { values: [] } }),
  batchUpdate: jest.fn().mockResolvedValue({ data: { values: [] } })
};

module.exports = {
  google: {
    auth: {
      GoogleAuth: jest.fn().mockImplementation(() => ({
        getClient: jest.fn(),
      })),
    },
    sheets: jest.fn(() => ({
      spreadsheets: {
        values: valuesMock,
        batchUpdate: valuesMock.batchUpdate,
      },
    })),
  },
  __esModule: true,
  __mockValues: valuesMock
}; 