// Self-contained Code 128 (Subset B) SVG barcode generator
// Adapted from jcormont's vanilla JS implementation

const data = "212222222122222221121223121322131222122213122312132212221213221312231212112232122132122231113222123122123221223211221132221231213212223112312131311222321122321221312212322112322211212123212321232121111323131123131321112313132113132311211313231113231311112133112331132131113123113321133121313121211331231131213113213311213131311123311321331121312113312311332111314111221411431111111224111422121124121421141122141221112214112412122114122411142112142211241211221114413111241112134111111242121142121241114212124112124211411212421112421211212141214121412121111143111341131141114113114311411113411311113141114131311141411131"
    .split(/(\d{6})/)
    .filter(s => !!s);

const lookup = {};
for (let i = 32; i < 127; i++) {
    lookup[String.fromCharCode(i)] = [i - 32, data[i - 32]];
}

export class Barcode128Svg {
    constructor(input) {
        this.input = input || "";
        this.factor = 1.2;
        this.height = 30;
    }

    toString() {
        const h = this.height;
        const f = this.factor;
        let svg = "";
        let x = 0;
        let sum = 104;

        function draw(d) {
            if (!d) return;
            d.split("").forEach((n, i) => {
                // Alternates bar and space (i % 2 === 0 is bar, i % 2 === 1 is space)
                // Fill with rect for bars
                if (i % 2 === 0) {
                    svg += `<rect x="${x}" y="0" width="${+n * f}" height="${h}" fill="#000000" />\n`;
                }
                x += +n * f;
            });
        }

        // Draw start code (Start B)
        draw("211214");

        // Draw data characters
        this.input.split("").forEach((c, i) => {
            const l = lookup[c] || [0, ""];
            sum += l[0] * (i + 1);
            draw(l[1]);
        });

        // Draw checksum
        draw(data[sum % 103]);

        // Draw stop code
        draw("2331112");
        
        // Final bar (always B=2)
        svg += `<rect x="${x}" y="0" width="${2 * f}" height="${h}" fill="#000000" />\n`;
        x += 2 * f;

        return `<svg xmlns="http://www.w3.org/2000/svg" width="${x}px" height="${h}px" viewBox="0 0 ${x} ${h}">${svg}</svg>`;
    }
}
