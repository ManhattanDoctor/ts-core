import { FileUtil } from '@ts-core/backend/file';
import * as del from 'del';
import { dest, series, src, task } from 'gulp';
import * as clean from 'gulp-clean';
// import * as debug from 'gulp-debug';
import run from 'gulp-run-command';
import { createProject } from 'gulp-typescript';

// --------------------------------------------------------------------------
//
//  Properties
//
// --------------------------------------------------------------------------

const packages = {
    common: createProject('packages/common/tsconfig.json'),
    backend: createProject('packages/backend/tsconfig.json')
};

const modules = Object.keys(packages);
const output = `dist/@ts-core`;

// --------------------------------------------------------------------------
//
//  Package Methods
//
// --------------------------------------------------------------------------

const packageClean = async (packageName: string): Promise<void> => {
    const projectDirectory = `packages/${packageName}`;

    // Remove node_modules
    await del([`${projectDirectory}/node_modules`, `${projectDirectory}/package.json`], { force: true });

    // Remove compiled files
    await new Promise(resolve => {
        src(
            [
                `${projectDirectory}/**/*.js`,
                `${projectDirectory}/**/*.d.ts`,
                `${projectDirectory}/**/*.js.map`,
                `${projectDirectory}/**/*.d.ts.map`,
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

const packageBuild = async (packageName: string): Promise<void> => {
    const project = packages[packageName];
    const projectDirectory = project.projectDirectory;
    const outputDirectory = `${output}/${packageName}`;

    // Install dependencies if need
    if (!(await FileUtil.isExists(`${projectDirectory}/package-lock.json`))) {
        await run(`npm --prefix ${projectDirectory} install ${projectDirectory}`)();
    }

    // Remove output directory
    await del(outputDirectory, { force: true });

    // Format and fix code
    // await run(`prettier --write '${projectDirectory}/**/*.{ts,js,json}'`)();

    // Compile project
    await new Promise(resolve => {
        project
            .src()
            .pipe(project())
            .pipe(dest(outputDirectory))
            .on('finish', resolve);
    });

    // Copy files
    await new Promise(resolve => {
        src([`.npmrc`])
            //.pipe(debug())
            .pipe(dest(outputDirectory))
            .on('finish', resolve);
    });
};

const packagePublish = async (packageName: string, type: 'patch' | 'minor' | 'major'): Promise<void> => {
    const project = packages[packageName];
    const projectDirectory = project.projectDirectory;
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
    await run(`npm --prefix ${outputDirectory} publish ${outputDirectory}`)();
};

(() => {
    for (let packageName of modules) {
        task(`${packageName}:clean`, () => packageClean(packageName));
        task(`${packageName}:build`, () => packageBuild(packageName));
        task(`${packageName}:publish:patch`, () => packagePublish(packageName, 'patch'));
        task(`${packageName}:publish:minor`, () => packagePublish(packageName, 'minor'));
        task(`${packageName}:publish:major`, () => packagePublish(packageName, 'major'));
        task(`${packageName}:publish`, series(`${packageName}:publish:patch`));
    }
})();
