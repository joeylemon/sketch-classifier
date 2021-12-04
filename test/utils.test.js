import should from 'should' // eslint-disable-line no-unused-vars

import * as utils from '../src/utils.js'

describe('Util Functions', () => {
    it('should shuffle two arrays', done => {
        for (let j = 0; j < 10; j++) {
            // create arrays of 0...19
            const arr1 = Array.from(Array(20).keys())
            const arr2 = Array.from(Array(20).keys())

            // make copies before shuffling
            const a1 = [...arr1]
            const a2 = [...arr2]
            utils.shuffle(a1, a2)

            for (let i = 0; i < a1.length; i++) {
                const ogIdx = arr1.findIndex(e => e === a1[i])
                a1[i].should.equal(arr1[ogIdx])
                a2[i].should.equal(arr2[ogIdx])
            }
        }

        done()
    })
})