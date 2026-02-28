// src/services/PTWWorkflowService.js
import { ROLES } from '../constants/roles';

export class PTWWorkflowService {
  static stepRoles = {
    1: ROLES.SUPERVISOR,
    2: ROLES.SUPERVISOR,
    3: ROLES.SUPERVISOR,
    4: ROLES.CONTRACTOR,
    5: ROLES.CONTRACTOR,
    6: ROLES.CONTRACTOR,
    7: ROLES.CONTRACTOR,
    8: ROLES.CONTRACTOR,
    9: ROLES.SAFETY_OFFICER,
    10: ROLES.SAFETY_OFFICER,
  };

  static stepNames = {
    1: "Basic Information",
    2: "Security Verification",
    3: "Work Type Selection",
    4: "Equipment Required",
    5: "PPE Required",
    6: "Safety Checklists",
    7: "Risk Assessment",
    8: "Tool Box Talk",
    9: "Authorization",
    10: "Permit Closure",
  };

  static initializeWorkflow(createdBy, createdByRole) {
    const steps = Array.from({ length: 10 }, (_, i) => {
      const stepNumber = i + 1;
      return {
        step: stepNumber,
        name: this.stepNames[stepNumber],
        role: this.stepRoles[stepNumber],
        completed: false,
        completedBy: null,
        completedByRole: null,
        completedAt: null,
        status: stepNumber === 1 ? "in_progress" : "pending",
        data: {},
        notes: "",
      };
    });

    return {
      currentStep: 1,
      currentRole: this.stepRoles[1],
      status: "in_progress",
      steps,
      stepOwners: { 1: createdBy },
      timeline: [{
        step: 1,
        action: "started",
        by: createdBy,
        byRole: createdByRole,
        at: new Date().toISOString(),
        note: "PTW created",
      }],
      completedSteps: [],
      pendingSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      stepData: {},
      metadata: {
        createdBy,
        createdByRole,
        createdAt: new Date().toISOString(),
        lastModifiedBy: createdBy,
        lastModifiedAt: new Date().toISOString(),
        totalSteps: 10,
        completionPercentage: 0,
      },
    };
  }

  static canEditPTW(user, ptw) {
    if (!user || !ptw) return false;
    
    // Admin can edit everything
    if (user.role === ROLES.ADMIN) return true;
    
    // Check if PTW is still in progress
    if (ptw.workflow?.status !== "in_progress") return false;

    const currentStep = ptw.workflow?.currentStep;
    if (!currentStep) return false;

    const requiredRole = this.stepRoles[currentStep];
    const stepCompleted = ptw.workflow.steps[currentStep - 1]?.completed;
    
    // User can edit if they have the required role AND step is not completed
    return (user.role === requiredRole && !stepCompleted);
  }

  static isStepAvailableForUser(user, stepNumber, ptw) {
    if (!user || !ptw) return false;
    
    // Admin can access all steps
    if (user.role === ROLES.ADMIN) return true;
    
    // Check if the step is the current step in workflow
    if (stepNumber !== ptw.workflow?.currentStep) return false;

    const requiredRole = this.stepRoles[stepNumber];
    
    // User must have the correct role for this step
    if (user.role !== requiredRole) return false;
    
    // Step shouldn't be completed already
    if (ptw.workflow.steps[stepNumber - 1]?.completed) return false;

    // Check if all previous steps are completed
    for (let i = 0; i < stepNumber - 1; i++) {
      if (!ptw.workflow.steps[i]?.completed) return false;
    }

    return true;
  }

  static completeStep(ptw, stepNumber, user, stepData, notes = "") {
    const updatedPTW = JSON.parse(JSON.stringify(ptw));
    const stepIndex = stepNumber - 1;
    const now = new Date().toISOString();

    // Mark current step as completed
    updatedPTW.workflow.steps[stepIndex] = {
      ...updatedPTW.workflow.steps[stepIndex],
      completed: true,
      completedBy: user?.name || user?.username || 'Unknown',
      completedByRole: user?.role,
      completedAt: now,
      status: "completed",
      data: stepData,
      notes: notes,
    };

    updatedPTW.workflow.stepData[stepNumber] = stepData;
    updatedPTW.workflow.completedSteps.push(stepNumber);
    updatedPTW.workflow.pendingSteps = updatedPTW.workflow.pendingSteps.filter(s => s !== stepNumber);

    // Add to timeline
    updatedPTW.workflow.timeline.push({
      step: stepNumber,
      action: "completed",
      by: user?.name || user?.username || 'Unknown',
      byRole: user?.role,
      at: now,
      note: notes || `Step ${stepNumber} completed`,
    });

    // Move to next step or complete
    if (stepNumber < 10) {
      const nextStep = stepNumber + 1;
      updatedPTW.workflow.currentStep = nextStep;
      updatedPTW.workflow.currentRole = this.stepRoles[nextStep];
      updatedPTW.workflow.steps[nextStep - 1].status = "in_progress";

      updatedPTW.workflow.timeline.push({
        step: nextStep,
        action: "started",
        by: null,
        byRole: this.stepRoles[nextStep],
        at: now,
        note: `Waiting for ${this.stepRoles[nextStep]}`,
      });
    } else {
      updatedPTW.workflow.status = "completed";
      updatedPTW.status = "completed";
    }

    // Update metadata
    updatedPTW.workflow.metadata.lastModifiedBy = user?.name || user?.username || 'Unknown';
    updatedPTW.workflow.metadata.lastModifiedAt = now;
    updatedPTW.workflow.metadata.completionPercentage =
      (updatedPTW.workflow.completedSteps.length / 10) * 100;

    return updatedPTW;
  }

  static getUserPendingActions(user, ptwList) {
    if (!user) return [];
    
    return ptwList.filter(ptw => {
      // Only consider PTWs in progress
      if (ptw.workflow?.status !== "in_progress") return false;
      
      const currentStep = ptw.workflow?.currentStep;
      if (!currentStep) return false;
      
      const requiredRole = this.stepRoles[currentStep];
      const stepCompleted = ptw.workflow.steps[currentStep - 1]?.completed;
      
      // User has pending action if they have the required role AND step not completed
      return (user.role === requiredRole && !stepCompleted);
    });
  }

  static getWorkflowSummary(ptw) {
    const completedSteps = ptw.workflow?.completedSteps?.length || 0;
    const totalSteps = 10;
    const percentage = (completedSteps / totalSteps) * 100;

    let statusColor = "#f59e0b";
    if (ptw.workflow?.status === "completed") statusColor = "#10b981";
    if (ptw.workflow?.status === "cancelled") statusColor = "#ef4444";

    return {
      currentStep: ptw.workflow?.currentStep || 1,
      currentStepName: this.stepNames[ptw.workflow?.currentStep || 1],
      currentRole: ptw.workflow?.currentRole || this.stepRoles[1],
      completedSteps,
      totalSteps,
      percentage: Math.round(percentage),
      status: ptw.workflow?.status || "in_progress",
      statusColor,
      lastUpdated: ptw.workflow?.metadata?.lastModifiedAt,
      createdBy: ptw.workflow?.metadata?.createdBy,
      createdAt: ptw.workflow?.metadata?.createdAt,
    };
  }

  static getProgressSteps(ptw) {
    if (!ptw.workflow?.steps) return [];
    return ptw.workflow.steps.map(step => ({
      step: step.step,
      name: step.name,
      role: step.role,
      status: step.status,
      completed: step.completed,
      isCurrent: step.step === ptw.workflow.currentStep,
      completedBy: step.completedBy,
      completedAt: step.completedAt,
    }));
  }
}