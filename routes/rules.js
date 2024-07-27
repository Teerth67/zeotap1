const { evaluateRule, convertDocumentToNode, combineRules, saveNode, parseRule } = require('../createast');
const { RuleModel } = require('../models/rules');

const express = require('express');
const router = express.Router();

// Create a new rule
router.post('/create_rule', async (req, res) => {
  const { ruleString, ruleName } = req.body;
  try {
    // Parse the rule string to an AST
    const astRoot = parseRule(ruleString);
    // Save the AST to the database
    const rootId = await saveNode(astRoot);
    // Create and save the rule
    const rule = new RuleModel({
      name: ruleName,
      root: rootId
    });
    await rule.save();
    res.status(201).json({ message: 'Rule created successfully', rule });
  } catch (error) {
    console.error('Error creating rule:', error); // Log error for debugging
    res.status(500).json({ message: 'Error creating rule', error: error.message });
  }
});

// Evaluate a rule
router.post('/evaluate_rule', async (req, res) => {
  const { ruleId, data } = req.body;
  
  try {
    // Find the rule by ID and populate its AST
    const rule = await RuleModel.findById(ruleId).populate('root').exec();
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    // Convert the saved AST back to a Node structure
    const ast = await convertDocumentToNode(rule.root);
    // Evaluate the rule against the provided data
    const result = evaluateRule(ast, data);
    res.status(200).json({ message: 'Rule evaluated successfully', result });
  } catch (error) {
    console.error('Error evaluating rule:', error); // Log error for debugging
    res.status(500).json({ message: 'Error evaluating rule', error: error.message });
  }
});

// Combine multiple rules into one
router.post('/combine_rules', async (req, res) => {
  const { rules } = req.body;

  try {
    // Combine the rules into a single AST
    const combinedAST = combineRules(rules);
    // Save the combined AST to the database
    const rootId = await saveNode(combinedAST);
    res.status(200).json({ message: 'Rules combined successfully', rootId });
  } catch (error) {
    console.error('Error combining rules:', error); // Log error for debugging
    res.status(500).json({ message: 'Error combining rules', error: error.message });
  }
});

module.exports = router;
