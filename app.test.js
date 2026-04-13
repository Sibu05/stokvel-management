test('Environment check', () => {
    expect(process.env.DATABASE_URL).toBeDefined();
}); 