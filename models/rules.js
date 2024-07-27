const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  type: { type: String, required: true },  // "operator" or "operand"
  value: { type: String },  // condition value for "operand" nodes
  left: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
  right: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' }
});

const ruleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  root: { type: mongoose.Schema.Types.ObjectId, ref: 'Node', required: true }
});

const NodeModel = mongoose.model('Node', nodeSchema);
const RuleModel = mongoose.model('Rule', ruleSchema);

module.exports = { NodeModel, RuleModel };  // Ensure both are exported
