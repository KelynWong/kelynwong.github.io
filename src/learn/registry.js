import { defineAsyncComponent } from 'vue'

const load = (loader) => defineAsyncComponent(loader)

export const categories = [
  {
    id: 'ds',
    name: 'Data Structures',
    tagline: 'How data is laid out in memory, and why that layout decides what is fast and what is slow.',
  },
  {
    id: 'algo',
    name: 'Algorithms',
    tagline: 'Step through executions one operation at a time: pointers, recursion trees, queues and tables. Nothing happens off-screen.',
  },
  {
    id: 'cloud',
    name: 'Cloud Architecture',
    tagline: 'Build architectures, pump traffic through them, then break them on purpose and watch what fails.',
  },
  {
    id: 'regex',
    name: 'Regex & Strings',
    tagline: 'Watch pattern matching and string transformations happen character by character.',
  },
  {
    id: 'concurrency',
    name: 'Concurrency & Async',
    tagline: 'Threads, locks and event loops. Step through the interleavings that cause the bugs nobody can reproduce.',
  },
  {
    id: 'db',
    name: 'Databases & Storage',
    tagline: 'Indexes, joins and caches. See why some queries fly and others crawl.',
  },
  {
    id: 'net',
    name: 'Networking',
    tagline: 'From typing a URL to pixels on screen: DNS, TCP handshakes, and packets that get lost along the way.',
  },
  {
    id: 'os',
    name: 'OS Fundamentals',
    tagline: 'Memory, scheduling and garbage collection. What the machine is actually doing under your code.',
  },
  {
    id: 'git',
    name: 'Git Internals',
    tagline: 'Commits are a graph. Once you can see it, merge and rebase stop being scary.',
  },
]

export const topics = [
  // ---------- data structures ----------
  {
    id: 'array', cat: 'ds', title: 'Arrays',
    blurb: 'Fixed-size, contiguous memory. See why index access is O(1) but searching is O(N).',
    badges: [['access: O(1) time', 'good'], ['search: O(N) time', 'mid'], ['fixed size', '']],
    component: load(() => import('./viz/ds/ArrayViz.vue')),
  },
  {
    id: 'dynamic-array', cat: 'ds', title: 'Dynamic Arrays',
    blurb: 'Resizable arrays (Python list, Java ArrayList). Watch the double-and-copy that makes push amortized O(1).',
    badges: [['push: O(1) amortized time', 'good'], ['resize: O(N) time', 'bad'], ['space: O(capacity)', 'mid']],
    component: load(() => import('./viz/ds/DynamicArrayViz.vue')),
  },
  {
    id: 'linked-list', cat: 'ds', title: 'Linked Lists',
    blurb: 'Nodes connected by pointers. Insertions are just pointer rewiring, but finding a node means walking the chain.',
    badges: [['insert: O(1) time', 'good'], ['search: O(N) time', 'mid'], ['space: O(N) + pointers', 'mid']],
    component: load(() => import('./viz/ds/LinkedListViz.vue')),
  },
  {
    id: 'stack', cat: 'ds', title: 'Stacks',
    blurb: 'Last-In-First-Out. The structure behind undo, back buttons and every recursive call you make.',
    badges: [['push/pop: O(1) time', 'good'], ['LIFO', '']],
    component: load(() => import('./viz/ds/StackViz.vue')),
  },
  {
    id: 'queue', cat: 'ds', title: 'Queues',
    blurb: 'First-In-First-Out. Task schedulers, message brokers and BFS all sit on top of this.',
    badges: [['enqueue/dequeue: O(1) time', 'good'], ['FIFO', '']],
    component: load(() => import('./viz/ds/QueueViz.vue')),
  },
  {
    id: 'hash-table', cat: 'ds', title: 'Hash Tables',
    blurb: 'Key → hash → bucket. Watch the hash being computed, and what happens when two keys collide.',
    badges: [['lookup: O(1) avg time', 'good'], ['space: O(N)', 'mid'], ['collisions', 'mid']],
    component: load(() => import('./viz/ds/HashTableViz.vue')),
  },
  {
    id: 'bst', cat: 'ds', title: 'Trees (BST)',
    blurb: 'Binary search trees: every insert and search is a series of left/right decisions. Includes traversals.',
    badges: [['search: O(log N)* time', 'good'], ['can degrade: O(N) time', 'bad']],
    component: load(() => import('./viz/ds/BstViz.vue')),
  },
  {
    id: 'heap', cat: 'ds', title: 'Heaps',
    blurb: 'A tree that lives inside an array. Watch sift-up and sift-down keep the minimum on top, in both views at once.',
    badges: [['peek: O(1) time', 'good'], ['push/pop: O(log N) time', 'good'], ['priority queue', '']],
    component: load(() => import('./viz/ds/HeapViz.vue')),
  },
  {
    id: 'graph', cat: 'ds', title: 'Graphs',
    blurb: 'Vertices and edges. Build your own graph and watch its adjacency list update live.',
    badges: [['adjacency list: O(V+E) space', 'mid'], ['directed / undirected', '']],
    component: load(() => import('./viz/ds/GraphViz.vue')),
  },

  // ---------- algorithms ----------
  {
    id: 'binary-search', cat: 'algo', title: 'Binary Search',
    blurb: 'Halve the search space every step. lo / mid / hi pointers on a sorted array.',
    badges: [['time: O(log N)', 'good'], ['space: O(1)', 'good'], ['needs sorted input', '']],
    component: load(() => import('./viz/algo/BinarySearchViz.vue')),
  },
  {
    id: 'quick-sort', cat: 'algo', title: 'Quick Sort',
    blurb: 'Pick a pivot, partition around it, recurse. Watch the pivot find its final home each round.',
    badges: [['time: O(N log N) avg', 'good'], ['time: O(N²) worst', 'bad'], ['space: O(log N), in-place', 'good']],
    component: load(() => import('./viz/algo/QuickSortViz.vue')),
  },
  {
    id: 'merge-sort', cat: 'algo', title: 'Merge Sort',
    blurb: 'Split until trivial, then merge sorted halves. The canonical divide & conquer sort.',
    badges: [['time: O(N log N)', 'good'], ['space: O(N) extra', 'mid'], ['stable', 'good']],
    component: load(() => import('./viz/algo/MergeSortViz.vue')),
  },
  {
    id: 'bfs', cat: 'algo', title: 'Breadth-First Search',
    blurb: 'Explore level by level with a queue. The frontier expands like a ripple and finds shortest hop counts.',
    badges: [['time: O(V+E)', 'good'], ['space: O(V) queue', 'mid'], ['shortest unweighted path', 'good']],
    component: load(() => import('./viz/algo/BfsViz.vue')),
  },
  {
    id: 'dfs', cat: 'algo', title: 'Depth-First Search',
    blurb: 'Dive as deep as possible, then backtrack. Watch the stack grow and unwind.',
    badges: [['time: O(V+E)', 'good'], ['space: O(V) stack', 'mid']],
    component: load(() => import('./viz/algo/DfsViz.vue')),
  },
  {
    id: 'dijkstra', cat: 'algo', title: "Dijkstra's Algorithm",
    blurb: 'Shortest paths on weighted graphs. Watch distances relax and nodes get settled one by one.',
    badges: [['time: O((V+E) log V)', 'good'], ['space: O(V)', 'mid'], ['no negative edges', 'mid']],
    component: load(() => import('./viz/algo/DijkstraViz.vue')),
  },
  {
    id: 'recursion', cat: 'algo', title: 'Recursion',
    blurb: 'fib(n) as a growing call tree, with the call stack beside it. See why naive recursion explodes.',
    badges: [['naive fib: O(2ⁿ) time', 'bad'], ['space: O(n) call stack', 'mid']],
    component: load(() => import('./viz/algo/RecursionViz.vue')),
  },
  {
    id: 'two-pointers', cat: 'algo', title: 'Two Pointers',
    blurb: 'Two indices converging on a sorted array. Turn O(N²) pair search into a single O(N) pass.',
    badges: [['time: O(N)', 'good'], ['space: O(1)', 'good'], ['needs sorted input', '']],
    component: load(() => import('./viz/algo/TwoPointersViz.vue')),
  },
  {
    id: 'sliding-window', cat: 'algo', title: 'Sliding Window',
    blurb: 'Keep a running window instead of recomputing every subarray. O(N²) → O(N) before your eyes.',
    badges: [['time: O(N)', 'good'], ['space: O(1)', 'good'], ['subarray / substring', '']],
    component: load(() => import('./viz/algo/SlidingWindowViz.vue')),
  },
  {
    id: 'divide-conquer', cat: 'algo', title: 'Divide & Conquer',
    blurb: 'Maximum subarray, solved by split → solve halves → combine across the middle. The recursion tree made visible.',
    badges: [['time: O(N log N)', 'good'], ['space: O(log N) recursion', 'good'], ['split / solve / combine', '']],
    component: load(() => import('./viz/algo/DivideConquerViz.vue')),
  },
  {
    id: 'greedy', cat: 'algo', title: 'Greedy Approach',
    blurb: 'Activity selection: always grab the earliest-finishing interval. Plus a case where greedy confidently fails.',
    badges: [['time: O(N log N)', 'good'], ['space: O(1)', 'good'], ['not always optimal', 'mid']],
    component: load(() => import('./viz/algo/GreedyViz.vue')),
  },
  {
    id: 'dp', cat: 'algo', title: 'Dynamic Programming',
    blurb: 'Unique paths on a grid: watch the table fill cell by cell, each one built from subproblems already solved.',
    badges: [['time: O(m·n)', 'good'], ['space: O(m·n) table', 'mid'], ['memoization / tabulation', '']],
    component: load(() => import('./viz/algo/DpViz.vue')),
  },

  // ---------- cloud architecture ----------
  {
    id: 'chaos-sim', cat: 'cloud', title: 'Failover Simulator',
    blurb: 'A live LB → app → primary/replica DB system. Pump up the traffic, kill instances, and watch failover, queueing and backpressure happen.',
    badges: [['chaos engineering', ''], ['failover / RTO', 'mid'], ['live simulation', 'good']],
    component: load(() => import('./viz/cloud/FailoverViz.vue')),
  },
  {
    id: 'spof-score', cat: 'cloud', title: 'Architecture Quality Score',
    blurb: 'Drag load balancers, app servers, databases and caches into two availability zones, and get live findings on single points of failure and missing redundancy.',
    badges: [['SPOF detection', 'bad'], ['redundancy', 'good'], ['drag & drop', ''], ['scored live', '']],
    component: load(() => import('./viz/cloud/ArchScoreViz.vue')),
  },

  // ---------- regex & strings ----------
  {
    id: 'regex-machine', cat: 'regex', title: 'Visual Pattern Matcher',
    blurb: 'A real backtracking regex engine, stepped character by character. Watch greedy quantifiers grab too much and give it back.',
    badges: [['backtracking', 'mid'], ['worst case: exponential time', 'bad'], ['ReDoS', 'bad']],
    component: load(() => import('./viz/regex/RegexMachineViz.vue')),
  },
  {
    id: 'edit-distance', cat: 'regex', title: 'Edit Distance Explorer',
    blurb: 'The DP matrix behind Levenshtein distance: watch it fill, then click any cell to see the exact insert/delete/substitute path.',
    badges: [['time: O(m·n)', 'good'], ['space: O(m·n) table', 'mid'], ['dynamic programming', '']],
    component: load(() => import('./viz/regex/EditDistanceViz.vue')),
  },

  // ---------- concurrency & async ----------
  {
    id: 'race-condition', cat: 'concurrency', title: 'Race Conditions',
    blurb: 'Two threads increment one counter and the result comes out wrong. Step through the exact interleaving that loses an update, then fix it with a mutex.',
    badges: [['lost update', 'bad'], ['mutex / lock', 'good'], ['read-modify-write', '']],
    component: load(() => import('./viz/concurrency/RaceConditionViz.vue')),
  },
  {
    id: 'deadlock', cat: 'concurrency', title: 'Deadlock',
    blurb: 'Two threads, two locks, opposite order: watch the circular wait form in the wait-for graph, then break it with lock ordering.',
    badges: [['circular wait', 'bad'], ['lock ordering', 'good'], ['wait-for graph', '']],
    component: load(() => import('./viz/concurrency/DeadlockViz.vue')),
  },
  {
    id: 'event-loop', cat: 'concurrency', title: 'The Event Loop',
    blurb: "JavaScript's call stack, microtask queue and macrotask queue, stepped line by line. Finally know why the promise logs before the timeout.",
    badges: [['call stack', ''], ['microtasks vs macrotasks', 'mid'], ['single-threaded', '']],
    component: load(() => import('./viz/concurrency/EventLoopViz.vue')),
  },

  // ---------- databases & storage ----------
  {
    id: 'btree', cat: 'db', title: 'B-Tree Indexes',
    blurb: 'The structure behind every database index. Insert keys, watch nodes split, then race an indexed lookup against a full table scan.',
    badges: [['lookup: O(log N)', 'good'], ['node splits', ''], ['why indexes work', '']],
    component: load(() => import('./viz/db/BTreeViz.vue')),
  },
  {
    id: 'joins', cat: 'db', title: 'SQL Joins',
    blurb: 'INNER, LEFT, RIGHT and FULL joins on two small tables, row by row. Watch matches pair up and see exactly where the NULLs come from.',
    badges: [['inner / left / right / full', ''], ['row matching', ''], ['NULL handling', 'mid']],
    component: load(() => import('./viz/db/SqlJoinsViz.vue')),
  },
  {
    id: 'lru-cache', cat: 'db', title: 'LRU Cache',
    blurb: 'Hash map + doubly-linked list working as one: O(1) lookups, most-recent at the front, and evictions from the tail when full.',
    badges: [['get/put: O(1) time', 'good'], ['eviction policy', ''], ['hash map + linked list', '']],
    component: load(() => import('./viz/db/LruCacheViz.vue')),
  },

  // ---------- networking ----------
  {
    id: 'url-journey', cat: 'net', title: 'URL to Page',
    blurb: 'The classic interview question, animated: cache checks, DNS resolution hop by hop, TCP, TLS, HTTP, and finally pixels.',
    badges: [['DNS resolution', ''], ['the full round trip', ''], ['interview classic', 'good']],
    component: load(() => import('./viz/net/UrlJourneyViz.vue')),
  },
  {
    id: 'tcp', cat: 'net', title: 'TCP Handshake & Delivery',
    blurb: 'SYN, SYN-ACK, ACK, then data with sequence numbers. Drop a packet on purpose and watch retransmission save the day.',
    badges: [['3-way handshake', ''], ['seq / ack numbers', ''], ['retransmission', 'good']],
    component: load(() => import('./viz/net/TcpViz.vue')),
  },

  // ---------- os fundamentals ----------
  {
    id: 'memory', cat: 'os', title: 'Stack vs Heap',
    blurb: 'Step through a program and watch stack frames push and pop while heap allocations appear, get referenced, and leak.',
    badges: [['stack frames', ''], ['heap allocation', ''], ['dangling pointers', 'bad']],
    component: load(() => import('./viz/os/StackHeapViz.vue')),
  },
  {
    id: 'scheduling', cat: 'os', title: 'CPU Scheduling',
    blurb: 'FCFS, Round Robin and Shortest-Job-First on the same workload. Watch the Gantt chart build and compare the waiting times.',
    badges: [['FCFS / RR / SJF', ''], ['Gantt chart', ''], ['waiting time', 'mid']],
    component: load(() => import('./viz/os/SchedulingViz.vue')),
  },
  {
    id: 'gc', cat: 'os', title: 'Garbage Collection',
    blurb: 'Mark and sweep on a live object graph: unlink some objects, trace from the roots, and watch the unreachable ones get reclaimed.',
    badges: [['mark & sweep', ''], ['reachability', ''], ['memory leaks', 'bad']],
    component: load(() => import('./viz/os/GcViz.vue')),
  },

  // ---------- git internals ----------
  {
    id: 'commit-dag', cat: 'git', title: 'The Commit Graph',
    blurb: 'Commit, branch, checkout and merge on a live DAG. Branches are just pointers, and HEAD is a pointer to a pointer.',
    badges: [['commits are a DAG', ''], ['branches are pointers', 'good'], ['HEAD', '']],
    component: load(() => import('./viz/git/CommitDagViz.vue')),
  },
  {
    id: 'merge-rebase', cat: 'git', title: 'Merge vs Rebase',
    blurb: 'The same diverged history resolved both ways, side by side: a merge commit joining two lines versus commits replayed onto a new base.',
    badges: [['merge commit', ''], ['history rewrite', 'mid'], ['new hashes on rebase', 'bad']],
    component: load(() => import('./viz/git/MergeRebaseViz.vue')),
  },
]

export function topicsFor(catId) {
  return topics.filter((t) => t.cat === catId)
}

export function findTopic(catId, topicId) {
  return topics.find((t) => t.cat === catId && t.id === topicId) || null
}
