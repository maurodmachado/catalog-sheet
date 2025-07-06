// Setup para tests
process.env.NODE_ENV = 'test';
process.env.SPREADSHEET_ID = 'test-spreadsheet-id';
process.env.ADMIN_USER = 'test-user';
process.env.ADMIN_PASSWORD = 'test-password';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Configurar timeouts más largos para tests
jest.setTimeout(10000);

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
}); 
process.env.NODE_ENV = 'test';
process.env.SPREADSHEET_ID = 'test-spreadsheet-id';
process.env.ADMIN_USER = 'test-user';
process.env.ADMIN_PASSWORD = 'test-password';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Configurar timeouts más largos para tests
jest.setTimeout(10000);

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
}); 