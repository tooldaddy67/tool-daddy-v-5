'use server';

export async function verifyAdminPassword(password: string): Promise<boolean> {
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
        console.error('ADMIN_PASSWORD environment variable is not set!');
        return false;
    }

    return password === correctPassword;
}
