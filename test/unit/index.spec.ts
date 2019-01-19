import * as fs from 'fs';
import * as path from 'path';
import PagesReader from '../../src/index';

describe('Pages', () => {
    describe('testFileMimeType()', () => {
        it('should check supported file types', () => {
            expect(PagesReader.testFileMimeType('application/vnd.apple.pages')).toBe(true);
            expect(PagesReader.testFileMimeType('application/vnd.apple.numbers')).toBe(false);
        });
    });

    describe('#read()', () => {
        it('should parse a .pages sample', () => {
            const filename: string = path.resolve(__dirname, '..', 'sample1.pages');
            const fileBuffer: Buffer = fs.readFileSync(filename);

            return new PagesReader().read({
                fileInfo: {
                    content: new Uint8Array(fileBuffer),
                    meta: {} as any
                }
            }).then((file) => {
                expect(file.getMeta()).toEqual({
                    createdAt: '',
                    creator: '',
                    fileType: 5,
                    mimeType: 'image/jpg',
                    modifiedAt: '',
                    name: '',
                    size: 70453
                });
                const {styles, content} = file.getData();

                expect(styles).toBe('<style></style>');
                expect(content).toMatch(/^<img src="data:image\/jpg;base64,/);
                expect(content).toMatchSnapshot();
            });
        });

        it('should parse the old file structure', () => {
            const filename: string = path.resolve(__dirname, '..', 'sample2.pages');
            const fileBuffer: Buffer = fs.readFileSync(filename);

            return new PagesReader().read({
                fileInfo: {
                    content: new Uint8Array(fileBuffer),
                    meta: {} as any
                }
            }).then((file) => {
                expect(file.getMeta()).toEqual({
                    createdAt: '',
                    creator: '',
                    fileType: 5,
                    mimeType: 'image/jpg',
                    modifiedAt: '',
                    name: '',
                    size: 5787
                });
                const {styles, content} = file.getData();

                expect(styles).toBe('<style></style>');
                expect(content).toMatch(/^<img src="data:image\/jpg;base64,/);
                expect(content).toMatchSnapshot();
            });
        });

        it('should validate a file structure', () => {
            const filename: string = path.resolve(__dirname, '..', 'invalid_sample1.pages');
            const fileBuffer: Buffer = fs.readFileSync(filename);

            expect.assertions(1);
            return new PagesReader().read({
                fileInfo: {
                    content: new Uint8Array(fileBuffer),
                    meta: {} as any
                }
            }).catch((error) => {
                expect(error).toEqual(new Error('file2html.errors.invalidFile'));
            });
        });
    });
});