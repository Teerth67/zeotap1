const { NodeModel } = require('./models/rules');

class Node {
    constructor(type, value = null, left = null, right = null) {
        this.type = type;
        this.value = value;
        this.left = left;
        this.right = right;
    }

    toJSON() {
        return {
            type: this.type,
            value: this.value,
            left: this.left ? this.left.toJSON() : null,
            right: this.right ? this.right.toJSON() : null
        };
    }
}

function parseRule(rule) {
    console.log(`Parsing rule: ${rule}`);
    
    function parseCondition(condition) {
        console.log(`Parsing condition: ${condition}`);
        const match = condition.match(/(\w+)\s*(=|>|<|>=|<=|!=)\s*(['"]?\w+['"]?)/);
        if (match) {
            const node = new Node('operand', {
                field: match[1],
                operator: match[2],
                value: match[3].replace(/['"]/g, "")
            });
            console.log(`Parsed operand node:`, node);
            return node;
        }
        return null;
    }

    function parseExpression(expression) {
        console.log(`Parsing expression: ${expression}`);
        expression = expression.trim();
        let depth = 0, lastOp = -1, op = '';

        for (let i = 0; i < expression.length; i++) {
            if (expression[i] === '(') depth++;
            if (expression[i] === ')') depth--;
            if (depth === 0) {
                if (expression.slice(i, i + 3).toUpperCase() === 'AND') {
                    op = 'AND';
                    lastOp = i;
                    break;
                } else if (expression.slice(i, i + 2).toUpperCase() === 'OR') {
                    op = 'OR';
                    lastOp = i;
                    break;
                }
            }
        }

        if (lastOp !== -1) {
            const left = expression.slice(0, lastOp).trim();
            const right = expression.slice(lastOp + op.length).trim();
            const node = new Node('operator', op, parseExpression(left), parseExpression(right));
            console.log(`Parsed operator node:`, node);
            return node;
        } else if (expression[0] === '(' && expression[expression.length - 1] === ')') {
            return parseExpression(expression.slice(1, -1).trim());
        } else {
            return parseCondition(expression);
        }
    }

    return parseExpression(rule);
}

function combineRules(rules) {
    console.log(`Combining rules:`, rules);
    if (rules.length === 0) return null;

    const asts = rules.map(rule => parseRule(rule));
    console.log(`Parsed ASTs:`, asts);

    function combineASTs(asts) {
        if (asts.length === 1) return asts[0];
    
        let root = new Node('operator', 'OR', asts[0], asts[1]);
    
        for (let i = 2; i < asts.length; i++) {
            root = new Node('operator', 'OR', root, asts[i]);
        }
    
        console.log(`Combined AST:`, root);
        return root;
    }
    

    return combineASTs(asts);
}
async function saveNode(node) {
    console.log(`Saving node:`, node);
    const nodeDocument = new NodeModel({
        type: node.type,
        value: node.type === 'operand' ? JSON.stringify(node.value) : node.value, // Save operator value as is
        left: node.left ? await saveNode(node.left) : null,
        right: node.right ? await saveNode(node.right) : null
    });
    await nodeDocument.save();
    console.log(`Saved node document ID: ${nodeDocument._id}`);
    return nodeDocument._id;
}


async function convertDocumentToNode(nodeId) {
    console.log(`Converting document to node for ID: ${nodeId}`);
    const nodeDocument = await NodeModel.findById(nodeId).exec();

    if (!nodeDocument) {
        console.log(`No document found for ID: ${nodeId}`);
        return null;
    }

    const node = new Node(nodeDocument.type, 
                          nodeDocument.type === 'operand' ? JSON.parse(nodeDocument.value) : nodeDocument.value);

    if (nodeDocument.left) {
        node.left = await convertDocumentToNode(nodeDocument.left);
    }

    if (nodeDocument.right) {
        node.right = await convertDocumentToNode(nodeDocument.right);
    }

    console.log(`Converted node:`, node);
    return node;
}

function evaluateNode(node, data) {
    if (node.type === 'operand') {
        const { field, operator, value } = node.value;
        const dataValue = data[field];
    
        switch (operator) {
            case '=':
                return dataValue == value; // Use == for equality check
            case '>':
                return dataValue > value;
            case '<':
                return dataValue < value;
            case '>=':
                return dataValue >= value;
            case '<=':
                return dataValue <= value;
            case '!=':
                return dataValue != value;
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    } else if (node.type === 'operator') {
        const leftResult = evaluateNode(node.left, data);
        const rightResult = evaluateNode(node.right, data);
    
        switch (node.value) {
            case 'AND':
                return leftResult && rightResult;
            case 'OR':
                return leftResult || rightResult;
            default:
                throw new Error(`Unknown operator type: ${node.value}`);
        }
    } else {
        throw new Error(`Unknown node type: ${node.type}`);
    }
}

function evaluateRule(ast, data) {
    return evaluateNode(ast, data);
}

module.exports = { parseRule, evaluateRule, combineRules, convertDocumentToNode, saveNode };
