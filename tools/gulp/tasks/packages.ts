import * as del from 'del';
import * as fs from 'fs';
import { dest, series, src, task } from 'gulp';
import * as clean from 'gulp-clean';
import run from 'gulp-run-command';
import { createProject } from 'gulp-typescript';

// --------------------------------------------------------------------------
//
//  Properties
//
// --------------------------------------------------------------------------

const packages = {
    common: createProject('packages/common/tsconfig.json'),
    backend: createProject('packages/backend/tsconfig.json'),
    frontend: createProject('packages/frontend/tsconfig.json'),
    blockchain: createProject('packages/blockchain/tsconfig.json'),
    'backend-nestjs': createProject('packages/backend-nestjs/tsconfig.json'),
    'frontend-angular': createProject('packages/frontend-angular/tsconfig.json')
};

const modules = Object.keys(packages);
const output = `dist/@ts-core`;

// --------------------------------------------------------------------------
//
//  Files Methods
//
// --------------------------------------------------------------------------

const filesDelete = async (files: Array<string>, options?: any): Promise<void> => {
    await new Promise(resolve => {
        src(files, options || { read: false })
            .pipe(clean())
            .on('finish', resolve);
    });
};

const filesCopy = async (files: Array<string>, destination: string, options?: any): Promise<void> => {
    await new Promise(resolve => {
        src(files, options || { allowEmpty: true })
            .pipe(dest(destination))
            .on('finish', resolve);
    });
};

const isFileExist = async (file: string): Promise<boolean> => {
    return new Promise(resolve => fs.exists(file, value => resolve(value)));
};

const isAngularPackage = (packageName: string): boolean => {
    return packageName === 'frontend-angular';
};

// --------------------------------------------------------------------------
//
//  Registry Methods
//
// --------------------------------------------------------------------------

const registryPublicSet = async (): Promise<void> => {
    await filesDelete([`packages/**/.npmrc`]);
};

const registryPrivateSet = async (): Promise<void> => {
    for (let packageName of modules) {
        await filesCopy([`.npmrc`], packages[packageName].projectDirectory);
    }
};

// --------------------------------------------------------------------------
//
//  Package Methods
//
// --------------------------------------------------------------------------

const nodeModulesClean = async (directory: string): Promise<void> => {
    // Remove node_modules
    await del([`${directory}/node_modules`, `${directory}/package-lock.json`], { force: true });
};

const packageClean = async (packageName: string): Promise<void> => {
    const projectDirectory = `packages/${packageName}`;

    // Remove node_modules
    await nodeModulesClean(projectDirectory);

    // Remove compiled files
    await filesDelete([
        `${projectDirectory}/**/*.js`,
        `${projectDirectory}/**/*.d.ts`,
        `${projectDirectory}/**/*.js.map`,
        `${projectDirectory}/**/*.d.ts.map`,
        `!${projectDirectory}/**/package.json`,
        `!${projectDirectory}/**/node_modules/**/*`
    ]);
};

const packageCompile = async (packageName: string): Promise<void> => {
    const project = packages[packageName];
    const outputDirectory = `${output}/${packageName}`;

    await new Promise(resolve => {
        project
            .src()
            .pipe(project())
            .pipe(dest(outputDirectory))
            .on('finish', resolve);
    });
};

const packageBuild = async (packageName: string): Promise<void> => {
    const projectDirectory = packages[packageName].projectDirectory;
    const outputDirectory = `${output}/${packageName}`;

    // Update dependencies or install it
    if (await isFileExist(`${projectDirectory}/package-lock.json`)) {
        // await run(`npm --prefix ${projectDirectory} update`)();
    } else {
        await run(`npm --prefix ${projectDirectory} install`)();
    }

    // Remove output directory
    await del(outputDirectory, { force: true });

    // Format and fix code
    await run(`prettier --write '${projectDirectory}/**/*.{ts,js,json}'`)();

    // Compile project
    await packageCompile(packageName);

    // Copy files
    if (!isAngularPackage(packageName)) {
        await filesCopy([`${projectDirectory}/.npmrc`, `${projectDirectory}/package.json`, `!${projectDirectory}/node_modules/**/*`], outputDirectory);
    } else {
        await run(`npm --prefix ${projectDirectory} run build`)();
        await filesCopy([`${projectDirectory}/src/style/**/*.scss`], `${outputDirectory}/style`);
        await filesCopy([`${outputDirectory}/**/*`], `examples/frontend/node_modules/@ts-core/${packageName}`);
    }
};

const packagePublish = async (packageName: string, type: 'patch' | 'minor' | 'major'): Promise<void> => {
    const projectDirectory = packages[packageName].projectDirectory;
    const outputDirectory = `${output}/${packageName}`;

    // Build package or copy files
    await packageBuild(packageName);

    // Update version of package.js

    // Copy package.js
    if (!isAngularPackage(packageName)) {
        await run(`npm --prefix ${projectDirectory} version ${type}`)();
        await filesCopy([`${projectDirectory}/package.json`], outputDirectory);
    } else {
        await run(`npm --prefix ${projectDirectory}/src version ${type}`)();
    }

    // Publish to npm
    await run(`npm --prefix ${outputDirectory} --access public publish ${outputDirectory}`)();
};

(() => {
    for (let packageName of modules) {
        task(`${packageName}:clean`, () => packageClean(packageName));
        task(`${packageName}:compile`, () => packageCompile(packageName));
        task(`${packageName}:build`, () => packageBuild(packageName));

        task(`${packageName}:publish:patch`, () => packagePublish(packageName, 'patch'));
        task(`${packageName}:publish:minor`, () => packagePublish(packageName, 'minor'));
        task(`${packageName}:publish:major`, () => packagePublish(packageName, 'major'));
        task(`${packageName}:publish`, series(`${packageName}:publish:patch`));
    }

    task(`all:clean`, series(modules.map(packageName => `${packageName}:clean`)));
    task(`all:compile`, series(modules.map(packageName => `${packageName}:compile`)));
    task(`all:build`, series(modules.map(packageName => `${packageName}:build`)));

    task(`clean`, () => nodeModulesClean('./'));
    task(`registry:public`, () => registryPublicSet());
    task(`registry:private`, () => registryPrivateSet());

    task(`frontend`, () => run(`npm --prefix examples/frontend run start`)());
})();
