import { clearBuckets, createMockUsers, deleteMockUsers } from "./utils";

export async function setup() {
    await createMockUsers();
}

export async function teardown() {
    await deleteMockUsers();
    await clearBuckets();
}
