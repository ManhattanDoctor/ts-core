import * as deleteEmpty from 'delete-empty';
import { series, src, task } from 'gulp';
import * as clean from 'gulp-clean';
import { source } from '../config';

/**
 * Cleans the build output assets from the packages folders
 */
function cleanOutput() {
    return src([`${source}/**/*.js`, `${source}/**/*.d.ts`, `${source}/**/*.js.map`, `${source}/**/*.d.ts.map`, `!${source}/**/node_modules/**/*`], {
        read: false
    }).pipe(clean());
}

/**
 * Cleans empty dirs
 */
function cleanEmpty(done: () => void) {
    deleteEmpty.sync(`${source}/`);
    done();
}

task('clean:empty', cleanEmpty);
task('clean:output', cleanOutput);
//task('clean', series('clean:output', 'clean:empty'));
task('clean', series('clean:output'));
