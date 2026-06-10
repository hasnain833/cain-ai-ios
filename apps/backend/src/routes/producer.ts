// apps/backend/src/routes/producer.ts
import { Router, Request, Response } from "express";
import { prisma } from "database";
import { authenticate } from "../middleware/auth.js";
import { GHLClient } from "../integrations/ghl/client.js";

const router = Router();

// Mount auth middleware for all producer routes
router.use(authenticate);

/**
 * Helper: Find active GHL connection for user's workspace
 */
async function getGHLClient(req: Request) {
  const workspaceId = req.user?.workspaceId;
  const agencyId = req.user?.agencyId;

  if (!workspaceId) return null;

  const connection = await prisma.integrationConnection.findFirst({
    where: {
      agencyId,
      workspaceId,
      provider: "GHL",
      status: "CONNECTED",
    },
  });

  if (!connection) return null;

  return {
    client: new GHLClient(connection.id),
    externalIds: connection.externalIds as Record<string, any>,
  };
}

/**
 * 1. GET /api/producer/leads
 */
router.get("/leads", async (req: Request, res: Response) => {
  try {
    const ghl = await getGHLClient(req);
    if (ghl && ghl.externalIds?.locationId) {
      try {
        const data = await ghl.client.getContacts(ghl.externalIds.locationId);
        // Map GHL contacts to our response structure
        const mappedLeads = (data.contacts || []).map((c: any) => ({
          id: c.id,
          firstName: c.firstName || "",
          lastName: c.lastName || "",
          email: c.email || "",
          phone: c.phone || "",
          status: c.contactName ? "Contacted" : "New",
          assignedToName: req.user?.firstName + " " + req.user?.lastName,
          tags: c.tags || ["GHL Lead"],
          createdAt: c.dateAdded || new Date(),
        }));
        res.json({ leads: mappedLeads });
        return;
      } catch (err) {
        console.warn("[Producer API] Failed to fetch leads from GHL, falling back to mock:", err);
      }
    }

    // Fallback Mock Data
    const mockLeads = [
      {
        id: "lead-1",
        firstName: "Sarah",
        lastName: "Jenkins",
        email: "sarah.j@example.com",
        phone: "(312) 555-0143",
        status: "New",
        assignedToName: `${req.user?.firstName} ${req.user?.lastName}`,
        tags: ["Auto Lead", "High Priority"],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "lead-2",
        firstName: "David",
        lastName: "Miller",
        email: "miller.d@example.com",
        phone: "(312) 555-0982",
        status: "Contacted",
        assignedToName: `${req.user?.firstName} ${req.user?.lastName}`,
        tags: ["Home Quote", "Bundle Opportunity"],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "lead-3",
        firstName: "Elena",
        lastName: "Rostova",
        email: "elena.r@example.com",
        phone: "(312) 555-2311",
        status: "In Progress",
        assignedToName: `${req.user?.firstName} ${req.user?.lastName}`,
        tags: ["Commercial Auto", "Business Owner"],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "lead-4",
        firstName: "Marcus",
        lastName: "Aurelius",
        email: "marcus.a@rome.com",
        phone: "(312) 555-9000",
        status: "New",
        assignedToName: `${req.user?.firstName} ${req.user?.lastName}`,
        tags: ["Umbrella Policy"],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: "lead-5",
        firstName: "Robert",
        lastName: "Chen",
        email: "bob.chen@example.com",
        phone: "(312) 555-4712",
        status: "Contacted",
        assignedToName: `${req.user?.firstName} ${req.user?.lastName}`,
        tags: ["Life Policy", "Family Plan"],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }
    ];

    res.json({ leads: mockLeads });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load leads: " + error.message });
  }
});

/**
 * 2. GET /api/producer/renewals
 */
router.get("/renewals", async (req: Request, res: Response) => {
  try {
    // Renewals are Cain-native insurance tracking. Check if GHL has custom fields or return mock.
    const mockRenewals = [
      {
        id: "renewal-1",
        clientName: "Jonathan Davis",
        policyType: "Auto + Home Bundle",
        policyNumber: "PA-882731-02",
        premium: 2450.00,
        carrier: "State Farm",
        renewalDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days out
        status: "Pending Review",
        riskScore: "High Risk (Rate Increase)",
      },
      {
        id: "renewal-2",
        clientName: "Amanda Croft",
        policyType: "Commercial Liability",
        policyNumber: "GL-900812-77",
        premium: 8900.00,
        carrier: "Travelers",
        renewalDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 days out
        status: "Contacted",
        riskScore: "Low Risk",
      },
      {
        id: "renewal-3",
        clientName: "William Sterling",
        policyType: "Homeowners Premium",
        policyNumber: "HO-332912-09",
        premium: 1850.00,
        carrier: "Progressive",
        renewalDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days out
        status: "Quoted",
        riskScore: "Medium Risk (Carrier Restructure)",
      },
      {
        id: "renewal-4",
        clientName: "Gregory Peck",
        policyType: "Personal Umbrella",
        policyNumber: "UM-110023-45",
        premium: 450.00,
        carrier: "Liberty Mutual",
        renewalDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: "Bound",
        riskScore: "Low Risk",
      },
      {
        id: "renewal-5",
        clientName: "Sophia Loren",
        policyType: "Auto Policy",
        policyNumber: "PA-772991-01",
        premium: 1200.00,
        carrier: "Geico",
        renewalDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Expired 3 days ago!
        status: "Lapsed",
        riskScore: "Critical Risk (Non-Payment)",
      }
    ];

    res.json({ renewals: mockRenewals });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load renewals: " + error.message });
  }
});

/**
 * 3. GET /api/producer/follow-ups
 */
router.get("/follow-ups", async (req: Request, res: Response) => {
  try {
    const mockFollowUps = [
      {
        id: "followup-1",
        clientName: "Michael Jordan",
        policyType: "Commercial Auto",
        lastContactedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        daysIdle: 14,
        reason: "Sent proposal, awaiting signature",
        status: "Overdue",
      },
      {
        id: "followup-2",
        clientName: "Clara Oswald",
        policyType: "Renters Insurance",
        lastContactedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        daysIdle: 5,
        reason: "Follow up on property inspection notes",
        status: "Due Today",
      },
      {
        id: "followup-3",
        clientName: "Bruce Wayne",
        policyType: "High-Value Asset Schedule",
        lastContactedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        daysIdle: 2,
        reason: "Awaiting appraisal documents",
        status: "Upcoming",
      }
    ];

    res.json({ followUps: mockFollowUps });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load follow-ups: " + error.message });
  }
});

/**
 * 4. GET /api/producer/appointments
 */
router.get("/appointments", async (req: Request, res: Response) => {
  try {
    const ghl = await getGHLClient(req);
    if (ghl && ghl.externalIds?.locationId) {
      try {
        const data = await ghl.client.getAppointments(ghl.externalIds.locationId);
        const mappedAppointments = (data.events || []).map((e: any) => ({
          id: e.id,
          clientName: e.title || "Meeting",
          title: e.description || "GHL Appointment",
          date: e.startTime ? new Date(e.startTime) : new Date(),
          duration: "30m",
          location: e.locationType || "Zoom",
          status: e.status || "Scheduled",
        }));
        res.json({ appointments: mappedAppointments });
        return;
      } catch (err) {
        console.warn("[Producer API] Failed to fetch appointments from GHL, falling back to mock:", err);
      }
    }

    const mockAppointments = [
      {
        id: "app-1",
        clientName: "David Miller",
        title: "Auto/Home Bundle Quote Review",
        date: new Date(Date.now() + 2 * 60 * 60 * 1000), // In 2 hours
        duration: "30m",
        location: "Zoom",
        status: "Scheduled",
      },
      {
        id: "app-2",
        clientName: "Elena Rostova",
        title: "Commercial Liability Underwriting Call",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: "45m",
        location: "Phone Call",
        status: "Scheduled",
      },
      {
        id: "app-3",
        clientName: "Jonathan Davis",
        title: "Renewal Retention Consulting",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        duration: "1h",
        location: "Cain Family Office",
        status: "Scheduled",
      }
    ];

    res.json({ appointments: mockAppointments });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load appointments: " + error.message });
  }
});

/**
 * 5. GET /api/producer/tasks
 */
router.get("/tasks", async (req: Request, res: Response) => {
  try {
    const ghl = await getGHLClient(req);
    if (ghl && ghl.externalIds?.locationId) {
      try {
        const data = await ghl.client.getTasks(ghl.externalIds.locationId);
        const mappedTasks = (data.tasks || []).map((t: any) => ({
          id: t.id,
          title: t.title || "CRM Task",
          description: t.description || "",
          dueDate: t.dueDate ? new Date(t.dueDate) : new Date(),
          priority: t.priority === "high" ? "High" : "Medium",
          completed: t.status === "completed",
          category: "GHL Action Item",
        }));
        res.json({ tasks: mappedTasks });
        return;
      } catch (err) {
        console.warn("[Producer API] Failed to fetch tasks from GHL, falling back to mock:", err);
      }
    }

    const mockTasks = [
      {
        id: "task-1",
        title: "Call Geico lapsed client (Sophia Loren)",
        description: "Policy PA-772991-01 has lapsed. Pitch Cain bundle with 15% discount.",
        dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // Today
        priority: "High",
        completed: false,
        category: "Renewal",
      },
      {
        id: "task-2",
        title: "Prepare homeowners quote for Sarah Jenkins",
        description: "Cross-sell homeowner insurance. Calculate standard replacement cost value.",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        priority: "Medium",
        completed: false,
        category: "Follow-up",
      },
      {
        id: "task-3",
        title: "Verify MVR logs for commercial auto lead",
        description: "Underwriting requested driving records for Elena's delivery team.",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: "High",
        completed: false,
        category: "Underwriting",
      },
      {
        id: "task-4",
        title: "Send signed binders to Progressive",
        description: "Submit William Sterling HO binder documents to clear audit warning.",
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
        priority: "Medium",
        completed: true,
        category: "Administrative",
      }
    ];

    res.json({ tasks: mockTasks });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load tasks: " + error.message });
  }
});

/**
 * 6. GET /api/producer/pipelines
 */
router.get("/pipelines", async (req: Request, res: Response) => {
  try {
    const ghl = await getGHLClient(req);
    if (ghl && ghl.externalIds?.locationId) {
      try {
        const data = await ghl.client.getOpportunities(ghl.externalIds.locationId);
        const mappedOps = (data.opportunities || []).map((o: any) => ({
          id: o.id,
          clientName: o.contact?.name || "Client Name",
          title: o.name || "Opportunity",
          value: o.monetaryValue || 0,
          status: o.status === "won" ? "Won" : o.status === "lost" ? "Lost" : "Open",
          stage: o.stageId || "Lead",
          updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
        }));
        res.json({ opportunities: mappedOps });
        return;
      } catch (err) {
        console.warn("[Producer API] Failed to fetch pipeline from GHL, falling back to mock:", err);
      }
    }

    const mockOpportunities = [
      {
        id: "op-1",
        clientName: "Sarah Jenkins",
        title: "Auto + Home Package Quote",
        value: 1850.00,
        status: "Open",
        stage: "Lead",
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "op-2",
        clientName: "David Miller",
        title: "Premium Home Bundle",
        value: 3200.00,
        status: "Open",
        stage: "Contacted",
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "op-3",
        clientName: "Elena Rostova",
        title: "Commercial Fleet Umbrella",
        value: 12500.00,
        status: "Open",
        stage: "Proposal",
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "op-4",
        clientName: "William Sterling",
        title: "Homeowners + Yacht Scheduled",
        value: 4600.00,
        status: "Open",
        stage: "Underwriting",
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "op-5",
        clientName: "Gregory Peck",
        policyType: "Personal Umbrella Binder",
        title: "Umbrella Liability 5M",
        value: 950.00,
        status: "Won",
        stage: "Bound",
        updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      }
    ];

    res.json({ opportunities: mockOpportunities });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load pipelines: " + error.message });
  }
});

/**
 * 7. GET /api/producer/conversations
 */
router.get("/conversations", async (req: Request, res: Response) => {
  try {
    const mockConversations = [
      {
        id: "chat-1",
        clientName: "Sarah Jenkins",
        lastMessage: "I uploaded my current dec page. Did you receive it?",
        lastMessageTime: new Date(Date.now() - 45 * 60 * 1000),
        unreadCount: 1,
        messages: [
          { sender: "producer", text: "Hi Sarah, I'm working on your Auto/Home bundle quotes. Could you send your current policy declaration pages?", time: "10:15 AM" },
          { sender: "client", text: "Sure, let me find them. I'll text them over shortly.", time: "10:20 AM" },
          { sender: "client", text: "I uploaded my current dec page. Did you receive it?", time: "11:00 AM" }
        ]
      },
      {
        id: "chat-2",
        clientName: "Sophia Loren",
        lastMessage: "Okay, please call me at 2:00 PM to talk about the Progressive rate.",
        lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unreadCount: 0,
        messages: [
          { sender: "producer", text: "Hi Sophia, I noticed your policy lapsed yesterday. I did a review and found a package with Progressive that saves you $120/year.", time: "8:30 AM" },
          { sender: "client", text: "Oh, thank you! Yes, my card expired so the auto-pay failed.", time: "9:15 AM" },
          { sender: "client", text: "Okay, please call me at 2:00 PM to talk about the Progressive rate.", time: "9:30 AM" }
        ]
      },
      {
        id: "chat-3",
        clientName: "Elena Rostova",
        lastMessage: "Perfect, looking forward to the underwriting review.",
        lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        unreadCount: 0,
        messages: [
          { sender: "client", text: "Did underwriting approve the extra driver?", time: "Yesterday" },
          { sender: "producer", text: "Yes Elena, I submitted the MVR check and they cleared Marcus. The binder is updated.", time: "Yesterday" },
          { sender: "client", text: "Perfect, looking forward to the underwriting review.", time: "Yesterday" }
        ]
      }
    ];

    res.json({ conversations: mockConversations });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load conversations: " + error.message });
  }
});

/**
 * 8. GET /api/producer/performance
 */
router.get("/performance", async (req: Request, res: Response) => {
  try {
    const mockPerformance = {
      totalPremium: 145800.00,
      activeLeadsCount: 24,
      conversionRate: 18.5,
      boundPoliciesCount: 32,
      revenueGoalProgress: 78.4, // percentage
      commissionEarned: 14580.00,
      monthlyDistribution: [
        { month: "Jan", premium: 12000 },
        { month: "Feb", premium: 18500 },
        { month: "Mar", premium: 22000 },
        { month: "Apr", premium: 31000 },
        { month: "May", premium: 28000 },
        { month: "Jun", premium: 34300 }
      ],
      carrierDistribution: [
        { carrier: "State Farm", premium: 58000, color: "#e11d48" },
        { carrier: "Progressive", premium: 42000, color: "#2563eb" },
        { carrier: "Travelers", premium: 28000, color: "#d97706" },
        { carrier: "Liberty Mutual", premium: 17800, color: "#16a34a" }
      ],
      producerRanking: [
        { name: `${req.user?.firstName} ${req.user?.lastName} (You)`, premium: 145800, rank: 1 },
        { name: "John Doe", premium: 128500, rank: 2 },
        { name: "Jane Smith", premium: 98000, rank: 3 },
        { name: "Bob Johnson", premium: 87500, rank: 4 },
        { name: "Alice Green", premium: 72000, rank: 5 }
      ]
    };

    res.json({ performance: mockPerformance });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load performance metrics: " + error.message });
  }
});

/**
 * 9. GET /api/producer/recommendations
 */
router.get("/recommendations", async (req: Request, res: Response) => {
  try {
    const mockRecommendations = [
      {
        id: "rec-1",
        clientName: "David Miller",
        type: "Cross-sell Bundle",
        recommendation: "Cross-sell Home policy. Client has active Auto policy with $2,450 premium. Bundling saves client 15% and adds $1,800 agency volume.",
        estimatedPremium: 1800.00,
        confidence: "High",
        reasoning: "Client bought a new home in Chicago last month according to credit alerts.",
      },
      {
        id: "rec-2",
        clientName: "Elena Rostova",
        type: "Commercial Umbrella",
        recommendation: "Add $2M Commercial Umbrella to existing Fleet policy. Protects growing delivery business assets against liability caps.",
        estimatedPremium: 1200.00,
        confidence: "Medium",
        reasoning: "Fleet size increased from 3 to 7 vehicles in GHL tags.",
      },
      {
        id: "rec-3",
        clientName: "Jonathan Davis",
        type: "Policy Retention",
        recommendation: "Proactive rate adjustment. State Farm auto rate increases 18% next week. Re-quote with Progressive immediately to retain account.",
        estimatedPremium: 2200.00,
        confidence: "High",
        reasoning: "Client renewal rate is flagged in risk queue due to carrier pricing changes.",
      }
    ];

    res.json({ recommendations: mockRecommendations });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load recommendations: " + error.message });
  }
});

/**
 * 10. GET /api/producer/attention-queue
 */
router.get("/attention-queue", async (req: Request, res: Response) => {
  try {
    const mockAttention = [
      {
        id: "attn-1",
        clientName: "Sophia Loren",
        trigger: "Auto Policy Lapsed (Non-payment)",
        severity: "Critical",
        suggestedAction: "Call client to process manual payment binder immediately.",
        daysIdle: 3,
      },
      {
        id: "attn-2",
        clientName: "Jonathan Davis",
        trigger: "High Value Renewal in 8 days - No contact record",
        severity: "High",
        suggestedAction: "Schedule review call. Total package value is $2,450.",
        daysIdle: 12,
      },
      {
        id: "attn-3",
        clientName: "Sarah Jenkins",
        trigger: "New hot lead idle for 48 hours",
        severity: "Medium",
        suggestedAction: "Send automated SMS quote follow-up.",
        daysIdle: 2,
      }
    ];

    res.json({ attentionQueue: mockAttention });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to load attention queue: " + error.message });
  }
});

export default router;
