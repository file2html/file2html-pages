import * as file2html from 'file2html';
import {Archive, readArchive} from 'file2html-archive-tools';
import {ArchiveEntry} from 'file2html-archive-tools/src/index';
import {errorsNamespace} from 'file2html/lib/errors';
import {lookup} from 'file2html/lib/mime';

const supportedMimeTypes: string[] = [lookup('.pages')];

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function bytesToString (bytes: Uint8Array): string {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
    const QUANTUM: number = 32768;
    const {length} = bytes;
    let result: string = '';

    for (let i = 0; i < length; i += QUANTUM) {
        result += String.fromCharCode.apply(null, bytes.slice(i, i + QUANTUM));
    }

    return result;
}

export default class FictionBookReader extends file2html.Reader {
    read ({fileInfo}: file2html.ReaderParams): Promise<file2html.File> {
        const fileContent: Uint8Array = fileInfo.content;

        return readArchive(fileContent).then((archive: Archive) => {
            const previewFile: ArchiveEntry|undefined = (
                archive.file('preview.jpg') ||
                archive.file('QuickLook/Thumbnail.jpg')
            );

            if (!previewFile) {
                return Promise.reject(new Error(
                    `${errorsNamespace}.invalidFile`
                )) as any;
            }

            return previewFile.async('uint8array');
        }).then((previewFileContent: Uint8Array) => {
            const {byteLength} = fileContent;
            const meta: file2html.FileMetaInformation = Object.assign({
                fileType: file2html.FileTypes.image,
                mimeType: 'image/jpg',
                name: '',
                size: byteLength,
                creator: '',
                createdAt: '',
                modifiedAt: ''
            }, fileInfo.meta);
            const base64: string = btoa(bytesToString(previewFileContent));

            return new file2html.File({
                meta,
                styles: '<style></style>',
                content: `<img src="data:${ meta.mimeType };base64,${ base64 }" alt="${ meta.name || '' }"/>`
            });
        });
    }

    static testFileMimeType (mimeType: string) {
        return supportedMimeTypes.indexOf(mimeType) >= 0;
    }
}