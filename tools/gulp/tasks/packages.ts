import { FileUtil } from '@ts-core/backend/file';
import * as del from 'del';
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
    'backend-nestjs': createProject('packages/backend-nestjs/tsconfig.json')
};

const modules = Object.keys(packages);
const output = `dist/@ts-core`;

// --------------------------------------------------------------------------
//
//  Registry Methods
//
// --------------------------------------------------------------------------

const registryPublicSet = async (): Promise<void> => {
    await new Promise(resolve => {
        src([`packages/**/.npmrc`], {
            read: false
        })
            .pipe(clean())
            .on('finish', resolve);
    });
};
const registryPrivateSet = async (): Promise<void> => {
    for (let packageName of modules) {
        await new Promise(resolve => {
            src([`.npmrc`])
                .pipe(dest(packages[packageName].projectDirectory))
                .on('finish', resolve);
        });
    }
};

// --------------------------------------------------------------------------
//
//  Package Methods
//
// --------------------------------------------------------------------------

const packageClean = async (packageName: string): Promise<void> => {
    const projectDirectory = `packages/${packageName}`;

    // Remove node_modules
    await del([`${projectDirectory}/node_modules`, `${projectDirectory}/package-lock.json`], { force: true });

    // Remove compiled files
    await new Promise(resolve => {
        src(
            [
                `${projectDirectory}/**/*.js`,
                `${projectDirectory}/**/*.d.ts`,
                `${projectDirectory}/**/*.js.map`,
                `${projectDirectory}/**/*.d.ts.map`,
                `!${projectDirectory}/**/package.json`,
                `!${projectDirectory}/**/node_modules/**/*`
            ],
            {
                read: false
            }
        )
            .pipe(clean())
            .on('finish', resolve);
    });
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
    if (await FileUtil.isExists(`${projectDirectory}/package-lock.json`)) {
        await run(`npm --prefix ${projectDirectory} update`)();
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
    await new Promise(resolve => {
        src([`${projectDirectory}/.npmrc`, `${projectDirectory}/package.json`, `${projectDirectory}/**/*.scss`], { allowEmpty: true })
            //.pipe(debug())
            .pipe(dest(outputDirectory))
            .on('finish', resolve);
    });
};

const packagePublish = async (packageName: string, type: 'patch' | 'minor' | 'major'): Promise<void> => {
    const projectDirectory = packages[packageName].projectDirectory;
    const outputDirectory = `${output}/${packageName}`;

    // Build package
    await packageBuild(packageName);

    // Update version of package.js
    await run(`npm --prefix ${projectDirectory} version ${type}`)();

    // Copy package.js
    await new Promise(resolve => {
        src([`${projectDirectory}/package.json`])
            .pipe(dest(outputDirectory))
            .on('finish', resolve);
    });

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

    task(`registry:public`, () => registryPublicSet());
    task(`registry:private`, () => registryPrivateSet());
})();
