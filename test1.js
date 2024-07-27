const { parseRule, evaluateRule, combineRules, convertDocumentToNode, saveNode } = require('./createast');
const mongoose = require('mongoose');

async function runTests() {
    await mongoose.connect('mongodb+srv://ast:123@cluster0.286axwx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

    // Sample data for evaluation
    const data = {
        age: 30,
        salary: 50000,
        position: 'developer'
    };

    // Test parseRule function
    console.log("\nTesting parseRule function:");
    const rule1 = "age > 25";
    const ast1 = parseRule(rule1);
    console.log(`AST for "${rule1}":`, JSON.stringify(ast1, null, 2));

    const rule2 = "salary = 50000 AND position = 'developer'";
    const ast2 = parseRule(rule2);
    console.log(`AST for "${rule2}":`, JSON.stringify(ast2, null, 2));

    // Test combineRules function
    console.log("\nTesting combineRules function:");
    const combinedAST = combineRules([rule1, rule2]);
    console.log("Combined AST:", JSON.stringify(combinedAST, null, 2));

    // Test saveNode and convertDocumentToNode functions
    console.log("\nTesting saveNode and convertDocumentToNode functions:");
    const savedNodeId = await saveNode(combinedAST);
    console.log("Saved node ID:", savedNodeId);

    const convertedNode = await convertDocumentToNode(savedNodeId);
    console.log("Converted node from document:", JSON.stringify(convertedNode, null, 2));

    // Test evaluateRule function
    console.log("\nTesting evaluateRule function:");
    const evaluationResult = evaluateRule(convertedNode, data);
    console.log("Evaluation result:", evaluationResult);

    // Clean up
    await mongoose.disconnect();
}

runTests().catch(error => console.error(error));