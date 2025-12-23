import app from "./app";
import request from "supertest";

describe("Health Check API", () => {
    it("should return status OK", async() => {
        const res = await request(app).get('/health');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("OK");
    })
});