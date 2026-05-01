"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MilestoneTracker;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
function MilestoneTracker(_a) {
    var milestones = _a.milestones, onMilestoneUpdate = _a.onMilestoneUpdate, onMilestoneCreate = _a.onMilestoneCreate, onMilestoneDelete = _a.onMilestoneDelete;
    var _b = (0, react_1.useState)(null), editingMilestone = _b[0], setEditingMilestone = _b[1];
    var _c = (0, react_1.useState)({}), editForm = _c[0], setEditForm = _c[1];
    // Get status icon
    var getStatusIcon = function (status) {
        switch (status) {
            case 'completed': return <lucide_react_1.CheckCircle className="w-5 h-5 text-green-500"/>;
            case 'in-progress': return <lucide_react_1.Circle className="w-5 h-5 text-blue-500"/>;
            case 'overdue': return <lucide_react_1.AlertCircle className="w-5 h-5 text-red-500"/>;
            default: return <lucide_react_1.Circle className="w-5 h-5 text-gray-300"/>;
        }
    };
    // Get status color
    var getStatusColor = function (status) {
        switch (status) {
            case 'completed': return 'border-green-200 bg-green-50';
            case 'in-progress': return 'border-blue-200 bg-blue-50';
            case 'overdue': return 'border-red-200 bg-red-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };
    // Check if milestone is overdue
    var isOverdue = function (milestone) {
        return (milestone.status !== 'completed' &&
            new Date(milestone.dueDate) < new Date());
    };
    // Handle edit milestone
    var handleEditMilestone = function (milestone) {
        setEditingMilestone(milestone.id);
        setEditForm(milestone);
    };
    // Handle save edit
    var handleSaveEdit = function () {
        if (editingMilestone && onMilestoneUpdate) {
            onMilestoneUpdate(editForm);
            setEditingMilestone(null);
            setEditForm({});
        }
    };
    // Handle cancel edit
    var handleCancelEdit = function () {
        setEditingMilestone(null);
        setEditForm({});
    };
    // Handle form change
    var handleFormChange = function (field, value) {
        setEditForm(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    // Toggle milestone completion
    var toggleMilestoneCompletion = function (milestone) {
        if (onMilestoneUpdate) {
            var updatedMilestone = __assign(__assign({}, milestone), { status: milestone.status === 'completed' ? 'in-progress' : 'completed', completedDate: milestone.status === 'completed' ? undefined : new Date(), progress: milestone.status === 'completed' ? 50 : 100 });
            onMilestoneUpdate(updatedMilestone);
        }
    };
    return (<card_1.Card className="w-full">
      <card_1.CardHeader className="flex flex-row items-center justify-between">
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Flag className="w-5 h-5"/>
          Project Milestones
        </card_1.CardTitle>
        <button_1.Button size="sm" onClick={onMilestoneCreate}>
          <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
          Add Milestone
        </button_1.Button>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-4">
          {milestones.map(function (milestone) {
            // Update status if overdue
            var updatedStatus = isOverdue(milestone) ? 'overdue' : milestone.status;
            return (<div key={milestone.id} className={"border rounded-lg p-4 ".concat(getStatusColor(updatedStatus))}>
                {editingMilestone === milestone.id ? (
                // Edit mode
                <div className="space-y-3">
                    <input type="text" value={editForm.title || ''} onChange={function (e) { return handleFormChange('title', e.target.value); }} className="font-medium text-lg w-full border-b pb-1" placeholder="Milestone title"/>
                    <textarea value={editForm.description || ''} onChange={function (e) { return handleFormChange('description', e.target.value); }} className="w-full border rounded p-2 text-sm" placeholder="Milestone description" rows={3}/>
                    <div className="flex gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Due Date</label>
                        <input type="date" value={editForm.dueDate ? new Date(editForm.dueDate).toISOString().split('T')[0] : ''} onChange={function (e) { return handleFormChange('dueDate', new Date(e.target.value)); }} className="w-full border rounded p-2"/>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Progress (%)</label>
                        <input type="number" min="0" max="100" value={editForm.progress || 0} onChange={function (e) { return handleFormChange('progress', parseInt(e.target.value) || 0); }} className="w-full border rounded p-2"/>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button_1.Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        Cancel
                      </button_1.Button>
                      <button_1.Button size="sm" onClick={handleSaveEdit}>
                        Save
                      </button_1.Button>
                    </div>
                  </div>) : (
                // View mode
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <button_1.Button variant="ghost" size="icon" onClick={function () { return toggleMilestoneCompletion(milestone); }} className="mt-1" aria-label={"Mark milestone ".concat(milestone.title, " as ").concat(milestone.status === 'completed' ? 'incomplete' : 'completed')}>
                          {getStatusIcon(updatedStatus)}
                        </button_1.Button>
                        <div>
                          <h3 className="font-medium text-lg">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button_1.Button variant="ghost" size="icon" onClick={function () { return handleEditMilestone(milestone); }} aria-label={"Edit milestone ".concat(milestone.title)}>
                          <lucide_react_1.Edit className="w-4 h-4"/>
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="icon" onClick={function () { return onMilestoneDelete && onMilestoneDelete(milestone.id); }} aria-label={"Delete milestone ".concat(milestone.title)}>
                          <lucide_react_1.Trash2 className="w-4 h-4"/>
                        </button_1.Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{milestone.progress}%</span>
                        </div>
                        <progress_1.Progress value={milestone.progress} className="h-2"/>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <lucide_react_1.Calendar className="w-4 h-4"/>
                          <span>
                            {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        {isOverdue(milestone) && (<div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                            <lucide_react_1.Clock className="w-3 h-3"/>
                            <span>Overdue</span>
                          </div>)}
                      </div>
                    </div>

                    {milestone.assignedTo && milestone.assignedTo.length > 0 && (<div className="flex flex-wrap gap-1">
                        {milestone.assignedTo.map(function (person, index) { return (<span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                            {person}
                          </span>); })}
                      </div>)}

                    {milestone.budget && (<div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">
                          Budget: ₦{milestone.budget.toLocaleString()}
                        </span>
                        {milestone.actualCost && (<span className={milestone.actualCost > milestone.budget ? 'text-red-500' : 'text-green-500'}>
                            Actual: ₦{milestone.actualCost.toLocaleString()}
                          </span>)}
                      </div>)}
                  </div>)}
              </div>);
        })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-medium mb-3">Milestone Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {milestones.filter(function (m) { return m.status === 'in-progress'; }).length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {milestones.filter(function (m) { return m.status === 'completed'; }).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {milestones.filter(function (m) { return m.status === 'not-started'; }).length}
              </div>
              <div className="text-sm text-muted-foreground">Not Started</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {milestones.filter(function (m) { return isOverdue(m); }).length}
              </div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
