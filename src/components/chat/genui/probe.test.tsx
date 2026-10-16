import { render } from "@testing-library/react";
import { it } from "vitest";
import { GenUIBlock } from "./GenUIBlock";
const s = JSON.stringify({title:"مقارنة بين iPhone\u202f16 و S25",blocks:[{type:"table",columns:["المواصفات","iPhone 16","S25","Pixel 9"],rows:[["السعر","$799","$799","$699"],["الشاشة",6.1,6.2,6.3]]},{type:"note",text:"x"},{type:"buttons",items:[{label:"a"},{label:"b"}]}]},null,2);
it("p", () => { const r = render(<GenUIBlock source={s} />); console.log(r.container.textContent?.slice(0,300)); });
