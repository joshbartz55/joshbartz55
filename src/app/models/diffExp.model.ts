export class DiffExp {
    gene?: string;
    fixed_effect?: string | string[];
    conf_high?: string | string[];
    conf_low?: string | string[];
    y_int?: string | string[];
    p_val?: string | string[];

    constructor(gene: string, fixed_effect: string | string[], conf_high: string | string[], conf_low: string | string[], y_int: string | string[], p_val: string | string[]) {
      this.gene = gene;
      this.fixed_effect = fixed_effect;
      this.conf_high = conf_high;
      this.conf_low = conf_low;
      this.y_int = y_int;
      this.p_val = p_val;
    }

    convertToList() {
      let convertedDiffExp = new DiffExp(
        this.gene!,
        String(this.fixed_effect).split(" ").slice(1),
        String(this.conf_high).split(" ").slice(1),
        String(this.conf_low).split(" ").slice(1),
        String(this.y_int).split(" ").slice(1),
        String(this.p_val).split(" ").slice(1),
      );
      return convertedDiffExp;
    }
  }