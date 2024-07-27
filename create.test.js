const mongoose = require('mongoose');
const { parseRule, evaluateRule, combineRules, convertDocumentToNode, saveNode } = require('./createast');
require('dotenv').config()
// Define the URI for your MongoDB instance (use a test database)
const MONGO_URI = process.env.mongo_url;

beforeAll(async () => {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
});

describe('AST Rule Management System', () => {
    const data = {
        age: 30,
        salary: 50000,
        position: 'developer'
    };

    test('parseRule function', () => {
        const rule1 = "age > 25";
        const ast1 = parseRule(rule1);
        expect(ast1).toMatchObject({
            type: 'operand',
            value: {
                field: 'age',
                operator: '>',
                value: '25'
            }
        });

        const rule2 = "salary = 50000 AND position = 'developer'";
        const ast2 = parseRule(rule2);
        expect(ast2).toMatchObject({
            type: 'operator',
            value: 'AND',
            left: {
                type: 'operand',
                value: {
                    field: 'salary',
                    operator: '=',
                    value: '50000'
                }
            },
            right: {
                type: 'operand',
                value: {
                    field: 'position',
                    operator: '=',
                    value: 'developer'
                }
            }
        });
    });

    test('combineRules function', () => {
        const rule1 = "age > 25";
        const rule2 = "salary = 50000 AND position = 'developer'";
        const combinedAST = combineRules([rule1, rule2]);
        expect(combinedAST).toMatchObject({
            type: 'operator',
            value: 'OR',
            left: {
                type: 'operand',
                value: {
                    field: 'age',
                    operator: '>',
                    value: '25'
                }
            },
            right: {
                type: 'operator',
                value: 'AND',
                left: {
                    type: 'operand',
                    value: {
                        field: 'salary',
                        operator: '=',
                        value: '50000'
                    }
                },
                right: {
                    type: 'operand',
                    value: {
                        field: 'position',
                        operator: '=',
                        value: 'developer'
                    }
                }
            }
        });
    });

    test('saveNode and convertDocumentToNode functions', async () => {
        const rule1 = "age > 25";
        const rule2 = "salary = 50000 AND position = 'developer'";
        const combinedAST = combineRules([rule1, rule2]);

        const savedNodeId = await saveNode(combinedAST);
        const convertedNode = await convertDocumentToNode(savedNodeId);

        expect(convertedNode).toMatchObject(combinedAST);
    });

    test('evaluateRule function', async () => {
        const rule1 = "age > 25";
        const rule2 = "salary = 50000 AND position = 'developer'";
        const combinedAST = combineRules([rule1, rule2]);

        const savedNodeId = await saveNode(combinedAST);
        const convertedNode = await convertDocumentToNode(savedNodeId);

        const evaluationResult = evaluateRule(convertedNode, data);
        expect(evaluationResult).toBe(true);
    });
});
