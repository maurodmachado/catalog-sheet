const valuesMock = {
  get: jest.fn(),
  append: jest.fn(),
  update: jest.fn(),
  batchUpdate: jest.fn()
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
  get: jest.fn(),
  append: jest.fn(),
  update: jest.fn(),
  batchUpdate: jest.fn()
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