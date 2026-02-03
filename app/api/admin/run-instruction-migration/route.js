import { NextResponse } from 'next/server';
const db = require('@/lib/db');
const fs = require('fs');
const path = require('path');

export async function POST() {
    try {
        const migrationPath = path.join(process.cwd(), 'database', 'instruction-images-migration.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await db.query(sql);

        return NextResponse.json({
            success: true,
            message: 'Instruction images migration completed!'
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
