import * as deleteEmpty from 'delete-empty';
import { series, src, task } from 'gulp';
import * as clean from 'gulp-clean';
import { source } from '../config';

/**
 * Cleans the build output assets from the packages folders
 */
function cleanOutput() {
    return src([`${source}/**/*.js`, `${source}/**/*.d.ts`, `${source}/**/*.js.map`, `${source}/**/*.d.ts.map`], {
        read: false
    }).pipe(clean());
}

/**
 * Cleans empty dirs
 */
function cleanDirs(done: () => void) {
    deleteEmpty.sync(`${source}/`);
    done();
}

task('clean:dirs', cleanDirs);
task('clean:output', cleanOutput);
task('clean:bundle', series('clean:output', 'clean:dirs'));
