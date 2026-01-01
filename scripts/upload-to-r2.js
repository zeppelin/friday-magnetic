#!/usr/bin/env node

/**
 * Script to upload MP3 files from static/ directory to R2 bucket
 *
 * Usage:
 *   node scripts/upload-to-r2.js
 *   node scripts/upload-to-r2.js --bucket=friday-magnetic
 *   node scripts/upload-to-r2.js --dry-run
 */

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

const BUCKET_NAME = process.env.R2_BUCKET;
const STATIC_DIR = './static';
const DRY_RUN = process.argv.includes('--dry-run');

if (!BUCKET_NAME) {
	throw new Error('R2_BUCKET environment variable is not set');
}

async function getMp3Files(dir) {
	const files = await readdir(dir);
	const mp3Files = files.filter((file) => file.endsWith('.mp3'));

	const filesWithStats = await Promise.all(
		mp3Files.map(async (file) => {
			const filePath = join(dir, file);
			const stats = await stat(filePath);
			return {
				name: file,
				path: filePath,
				size: stats.size,
				sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
			};
		})
	);

	return filesWithStats;
}

async function uploadToR2(file) {
	const command = `wrangler r2 object put ${BUCKET_NAME}/${file.name} --file=${file.path}`;

	if (DRY_RUN) {
		console.log(`[DRY RUN] Would run: ${command}`);
		return;
	}

	try {
		console.log(`Uploading ${file.name} (${file.sizeMB} MB)...`);
		execSync(command, { stdio: 'inherit' });
		console.log(`✓ Uploaded ${file.name}`);
	} catch (error) {
		console.error(`✗ Failed to upload ${file.name}:`, error.message);
		throw error;
	}
}

async function main() {
	console.log(`Finding MP3 files in ${STATIC_DIR}...`);

	try {
		const mp3Files = await getMp3Files(STATIC_DIR);

		if (mp3Files.length === 0) {
			console.log('No MP3 files found in static/ directory');
			return;
		}

		console.log(`\nFound ${mp3Files.length} MP3 file(s):`);
		mp3Files.forEach((file) => {
			console.log(`  - ${file.name} (${file.sizeMB} MB)`);
		});

		if (DRY_RUN) {
			console.log('\n[DRY RUN MODE] No files will be uploaded');
		} else {
			console.log(`\nUploading to R2 bucket: ${BUCKET_NAME}`);
			console.log('Make sure you are logged in: wrangler login\n');
		}

		for (const file of mp3Files) {
			await uploadToR2(file);
		}

		console.log('\n✓ All files uploaded successfully!');
		console.log(`\nDon't forget to set PUBLIC_R2_CDN_URL in your environment variables.`);
		console.log(`Example: https://${BUCKET_NAME}.r2.dev`);
	} catch (error) {
		console.error('Error:', error.message);
		process.exit(1);
	}
}

main();
