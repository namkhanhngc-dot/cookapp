import { NextResponse } from 'next/server';
const db = require('@/lib/db');
const fs = require('fs');
const path = require('path');

export async function POST() {
    try {
        // Read migration file
        const migrationPath = path.join(process.cwd(), 'database', 'banner-migration.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Execute migration
        await db.query(sql);

        return NextResponse.json({
            success: true,
            message: 'Banner migration completed successfully!'
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
