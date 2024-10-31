import path from "path";
import fs from "fs";

const resolvedPath = path.resolve("package.json");
const packageJson = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
const [major, minor, patch] = packageJson.version.split('.');
packageJson.version = `${major}.${minor}.${parseInt(patch)+1}`;

fs.writeFileSync(resolvedPath, JSON.stringify(packageJson, null, 2), 'utf8');

