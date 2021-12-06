import { Dataset } from "./src/data.js";

const ds = new Dataset('test_data.ndjson')

for (let i = 0; i < 10; i++) {
    const obj = await ds.dataGenerator().next()
    console.log(obj.value)
}