/**
 * Hard-Stop Executor — In-Flight Action Abort Engine
 * Target: 64ms for queue eviction, 85ms for WebRTC call drop.
 * 
 * Reference: Rules.md STOP-01, Evaluation.md §3.1
 */

// Mocked BullMQ queue instance since we don't have it set up yet
const queues = {
  diagnosisQueue: { getJobs: async () => [], remove: async (id: string) => {} },
  executionQueue: { getJobs: async () => [], remove: async (id: string) => {} },
  scheduledQueue: { getJobs: async () => [], remove: async (id: string) => {} }
};

export async function abortAllInFlight(caseId: string): Promise<{ abortedJobs: number, latencyMs: number }> {
  const start = process.hrtime.bigint();
  let abortedJobs = 0;
  
  // Remove pending BullMQ jobs
  for (const queueName of Object.keys(queues)) {
    const queue = queues[queueName as keyof typeof queues];
    const jobs = await queue.getJobs();
    for (const job of jobs as any[]) {
      if (job.data?.caseId === caseId) {
        await queue.remove(job.id);
        abortedJobs++;
      }
    }
  }
  
  // Cancels any active WhatsApp scheduled messages (mocked)
  
  // Sends WebRTC BYE signal to LiveKit room (mocked)
  
  const end = process.hrtime.bigint();
  const latencyMs = Number(end - start) / 1_000_000;
  
  console.log(`[HardStopExecutor] Aborted ${abortedJobs} jobs for case ${caseId} in ${latencyMs.toFixed(2)}ms`);
  
  return { abortedJobs, latencyMs };
}

export async function abortByJobId(queueName: string, jobId: string): Promise<boolean> {
  const queue = queues[queueName as keyof typeof queues];
  if (!queue) return false;
  
  try {
    await queue.remove(jobId);
    return true;
  } catch (error) {
    return false;
  }
}
