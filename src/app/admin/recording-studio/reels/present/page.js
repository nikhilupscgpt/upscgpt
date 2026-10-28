import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CURATED_MAPPING_NODES } from "@/lib/static-mapping-data";
import ReelsPresenterClient from "./ReelsPresenterClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "9:16 Vertical Reels Recorder | Admin",
  description:
    "9:16 vertical mobile stage for recording UPSC Prelims PYQ and Mapping Reels with condensed Question, Statement Analysis & Keywords slides.",
};

export default async function ReelsPresentPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  const sp = await searchParams;
  const mode = sp?.mode || "pyq";
  const questionIds = sp?.ids
    ? sp.ids.split(",").map((s) => s.trim()).filter(Boolean)
    : sp?.id
    ? [sp.id]
    : [];
  const mappingIds = sp?.mappingIds
    ? sp.mappingIds.split(",").map((s) => s.trim()).filter(Boolean)
    : sp?.mappingId
    ? [sp.mappingId]
    : mode === "mapping" && sp?.ids
    ? sp.ids.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const deckItems = [];

  if (mode === "mapping" || mappingIds.length > 0) {
    const requestedIds = mappingIds;
    const staticMap = new Map();
    for (const node of CURATED_MAPPING_NODES) {
      staticMap.set(node.id, node);
      if (node.slug) staticMap.set(node.slug, node);
    }

    const matchedStatic = [];
    if (requestedIds.length > 0) {
      for (const id of requestedIds) {
        if (staticMap.has(id)) {
          matchedStatic.push(staticMap.get(id));
        }
      }
    } else {
      matchedStatic.push(...CURATED_MAPPING_NODES.slice(0, 15));
    }

    let matchedPins = [];
    if (requestedIds.length > 0) {
      try {
        matchedPins = await prisma.placeInNews.findMany({
          where: {
            OR: [
              { id: { in: requestedIds } },
              { pinId: { in: requestedIds } },
              { slug: { in: requestedIds } },
            ],
          },
        });
      } catch (e) {
        console.error("[Reels Present] Error fetching PIN records:", e);
      }
    }

    const pinMap = new Map();
    for (const pin of matchedPins) {
      pinMap.set(pin.id, pin);
      if (pin.pinId) pinMap.set(pin.pinId, pin);
      if (pin.slug) pinMap.set(pin.slug, pin);
    }

    let matchedPyqs = [];
    if (requestedIds.length > 0) {
      try {
        matchedPyqs = await prisma.mappingPyq.findMany({
          where: { id: { in: requestedIds } },
        });
      } catch (e) {
        console.error("[Reels Present] Error fetching mapping PYQs:", e);
      }
    }

    const pyqMap = new Map();
    for (const q of matchedPyqs) {
      pyqMap.set(q.id, q);
    }

    const idOrder = requestedIds.length > 0 ? requestedIds : matchedStatic.map((n) => n.id);
    const addedKeys = new Set();

    for (const id of idOrder) {
      if (addedKeys.has(id)) continue;

      if (staticMap.has(id)) {
        const node = staticMap.get(id);
        addedKeys.add(id);
        const locText =
          node.locatedIn?.stateOrProvince ||
          node.locatedIn?.country ||
          (node.regionScope === "World" ? "Global" : "India");

        deckItems.push({
          id: node.id,
          type: "mapping",
          title: node.place,
          place: node.place,
          regionScope: node.regionScope || "India",
          mapCategory: Array.isArray(node.mapCategory)
            ? node.mapCategory.join(", ")
            : node.mapCategory || "Physical Geography",
          category: Array.isArray(node.mapCategory)
            ? node.mapCategory[0]
            : node.mapCategory || "Physical Geography",
          placeType: node.placeType || "Geographical Feature",
          locationText: locText,
          locatedIn: node.locatedIn,
          lat: node.lat,
          lng: node.lng,
          shape: Array.isArray(node.shape) ? node.shape : null,
          aliases: node.aliases || [],
          staticFacts: node.staticFacts || [],
          upscAngle: node.upscAngle || null,
          newsHook: node.newsHook || null,
          imageUrl: node.imageUrl || null,
          riverDetails: node.riverDetails || null,
        });
      } else if (pinMap.has(id)) {
        const pin = pinMap.get(id);
        addedKeys.add(id);
        const loc =
          pin.locatedIn && typeof pin.locatedIn === "object"
            ? Object.values(pin.locatedIn).filter(Boolean).join(", ")
            : pin.regionScope === "World"
            ? "World"
            : "India";

        deckItems.push({
          id: pin.id || pin.pinId,
          type: "mapping",
          title: pin.place,
          place: pin.place,
          regionScope: pin.regionScope || "India",
          placeType: pin.placeType || "Place in News",
          locationText: loc,
          lat: pin.lat || pin.coordinates?.lat,
          lng: pin.lng || pin.coordinates?.lng,
          shape: Array.isArray(pin.shape) ? pin.shape : null,
          aliases: pin.aliases || [],
          staticFacts: Array.isArray(pin.staticFacts) ? pin.staticFacts : [],
          upscAngle: pin.upscAngle || null,
          newsHook:
            Array.isArray(pin.newsTriggers) && pin.newsTriggers.length > 0
              ? pin.newsTriggers[0]?.newsHook
              : null,
        });
      } else if (pyqMap.has(id)) {
        const q = pyqMap.get(id);
        addedKeys.add(id);
        const catList =
          Array.isArray(q.mapCategory) && q.mapCategory.length > 0
            ? q.mapCategory
            : ["India – rivers, lakes & reservoirs"];

        deckItems.push({
          id: q.id,
          type: "mapping",
          title: `${q.exam} ${q.examYear}`,
          place: catList[0] || "Mapping PYQ",
          regionScope: "India",
          placeType: "Official Mapping PYQ",
          locationText: `${q.exam} ${q.examYear}`,
          stem: q.stem,
          options: q.options || [],
          correctLabel: q.correctLabel || "",
          staticFacts: q.answerText ? [q.answerText] : [],
          pyq: {
            stem: q.stem,
            options: q.options,
            correctLabel: q.correctLabel,
            answerText: q.answerText,
            exam: q.exam,
            examYear: q.examYear,
          },
        });
      }
    }
  }

  if (mode !== "mapping") {
    const andConditions = [];
    if (questionIds.length > 0) {
      andConditions.push({ id: { in: questionIds } });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const drafts = await prisma.questionDraft.findMany({
      where,
      take: 30,
      orderBy: [{ examYear: "desc" }, { questionNo: "asc" }],
      select: {
        id: true,
        dedupHash: true,
        examName: true,
        examYear: true,
        questionNo: true,
        srcSubject: true,
        srcTopic: true,
        stem: true,
        options: true,
        correctLabel: true,
        explanation: true,
        difficulty: true,
      },
    });

    let orderedDrafts = drafts;
    if (questionIds.length > 0) {
      const map = new Map(drafts.map((d) => [d.id, d]));
      orderedDrafts = questionIds.map((id) => map.get(id)).filter(Boolean);
    }

    for (const q of orderedDrafts) {
      let opts = [];
      if (Array.isArray(q.options)) {
        opts = q.options;
      } else if (typeof q.options === "string") {
        try {
          const parsed = JSON.parse(q.options);
          if (Array.isArray(parsed)) opts = parsed;
        } catch {
          opts = [];
        }
      }

      deckItems.push({
        id: q.id,
        type: "pyq",
        dedupHash: q.dedupHash,
        examName: q.examName || "UPSC CSE",
        examYear: q.examYear || "",
        questionNo: q.questionNo || "",
        srcSubject: q.srcSubject || "General Studies",
        srcTopic: q.srcTopic || "Prelims",
        stem: q.stem || "",
        options: opts,
        correctLabel: q.correctLabel || null,
        explanation: q.explanation || null,
        difficulty: q.difficulty || null,
      });
    }
  }

  return <ReelsPresenterClient questions={deckItems} />;
}
