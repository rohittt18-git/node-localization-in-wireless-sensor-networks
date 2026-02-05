import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { SavedRun, SimulationParams, Position, RSSIReading } from '@/types/simulation';

const COLLECTION_NAME = 'simulation_runs';

export async function saveSimulationRun(
  params: SimulationParams,
  targetTruePos: Position,
  targetPredictedPos: Position,
  error: number,
  runData: RSSIReading[]
): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const docData = {
    timestamp: Timestamp.now(),
    userId: user.uid,
    params,
    targetTruePos,
    targetPredictedPos,
    error,
    runData,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
  return docRef.id;
}

export async function loadSimulationRuns(): Promise<SavedRun[]> {
  const user = auth.currentUser;
  if (!user) {
    return [];
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", user.uid),
    orderBy("timestamp", "desc")
  );

  const querySnapshot = await getDocs(q);
  const runs: SavedRun[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    runs.push({
      id: doc.id,
      timestamp: data.timestamp.toDate().toISOString(),
      userId: data.userId,
      params: data.params,
      targetTruePos: data.targetTruePos,
      targetPredictedPos: data.targetPredictedPos,
      error: data.error,
      runData: data.runData,
    });
  });

  return runs;
}
