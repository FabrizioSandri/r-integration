const chai = require('chai')
const expect = chai.expect

const validator = require('../src/R.js')

describe("validator executeRCommand()", () => {

	it("should return 2 if executing 1+1", ()=> {
		expect(validator.executeRCommand("1+1")).to.have.members(["2"])
	})

    it("should return multiple outputs when executing commands separated by semicolon", ()=> {
		expect(validator.executeRCommand("print(1+1); print(5+5)")).to.have.members(["2", "10"])
	})

})

describe("validator executeRScript()", () => {

	it("should return 2 if printing 1+1 by executing an external RScript", ()=> {
		expect(validator.executeRScript("test/RScripts/test_basic.R")).to.have.members(["2"])
	})

    it("should return multiple values by executing an external RScript", ()=> {
		expect(validator.executeRScript("test/RScripts/test_basic_multiple.R")).to.have.members(["2", "4", "6"])
	})

})

describe("validator callMethod()", () => {

	it("should return 10 if calling the method x with parameter 5", ()=> {
		expect(validator.callMethod("test/RScripts/test_method.R", "x", [5])).to.have.members(["10"])
	})

	it("should return 10 if calling the method x with object parameter 5", ()=> {
		expect(validator.callMethod("test/RScripts/test_method.R", "x", {data: 5})).to.have.members(["10"])
	})

    it("should return the max between 10 and 20", ()=> {
		expect(validator.callMethod("test/RScripts/test_method_multiple_params.R", "max", [10, 20])).to.have.members(["20"])
	})

    it("should return the max between 10 and 20 with object parameters", ()=> {
		expect(validator.callMethod("test/RScripts/test_method_multiple_params.R", "max",{x:10, y:20})).to.have.members(["20"])
	})

})


describe("validator callStandardMethod()", () => {

	it("should return 5 if calling the method max with parameter 5", ()=> {
		expect(validator.callStandardMethod("max", [5])).to.have.members(["5"])
	})

	it("should return 5 if calling the method max with object parameter 5", ()=> {
		expect(validator.callStandardMethod("max", {data: [5]})).to.have.members(["5"])
	})

    it("should return the max between 10 and 20", ()=> {
		expect(validator.callStandardMethod("max", [10, 20])).to.have.members(["20"])
	})

    it("should return the max between 10 and 20 with object parameters", ()=> {
		expect(validator.callStandardMethod("max",{x:10, y:20})).to.have.members(["20"])
	})

})
