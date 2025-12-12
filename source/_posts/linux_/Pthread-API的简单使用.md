---
title: Pthread API的简单使用
cover: https://source.fomal.cc/img/default_cover_18.webp
tags:
  - pthread
  - operating system
abbrlink: 2be5aa7c
date: 2023-05-03 23:50:53
description: 关于pthread的创建、删除，以及互斥锁的API调用
---

此处使用到 Pthread API 的代码以《操作系统概念》第4章和第7章的 Programming Project 为例。

## 构建线程池
### `pthread_mutex_init()` 与 `pthread_mutex_destory()`
`pthread_mutex_init()` 函数用于初始化一个互斥锁对象，而 `pthread_mutex_destory()` 函数用于清除这个对象以释放资源。这两个函数在线程池的初始化和关闭的过程中会用到。
```c
// initialize the thread pool
void pool_init(void)
{
    queue_head = queue_tail = 0;
    pthread_mutex_init(&queue_mutex, NULL);        // initialize mutex
    sem_init(&thread_sem, 0, NUMBER_OF_THREADS);   // initialize sem
    for (int id = 0; id < NUMBER_OF_THREADS; id++) // initialize thread
        thread_working[id] = 0;
}

// shutdown the thread pool
void pool_shutdown(void)
{
    for (int id = 0; id < NUMBER_OF_THREADS; id++)
        pthread_join(thread_pool[id], NULL);
    pthread_mutex_destroy(&queue_mutex);
    sem_destroy(&thread_sem);
}
```

在线程池初始化的函数中使用了 `pthread_mutex_init(&queue_mutex, NULL)`，这里表示将一个 `pthread_mutex_t` 类型的变量 `queue_mutex` 初始化，而函数的第二个参数表示指向 `pthread_mutexattr_t` 的指针，用于设置互斥锁的属性。这里使用 `NULL` 则表示该 `queue_mutex` 将使用默认属性。同时需要注意，一个互斥锁只有经过初始化之后才能正常使用，所以这里的 `pthread_mutex_init()` 函数是必要的。

而在线程池的关闭函数中则使用了 `pthread_mutex_destroy(&queue_mutex)`，这里表示释放 `queue_mutex` 所占用的资源。同时在互斥锁不被使用后销毁是一个良好的编程习惯。

### `pthread_creat()` 与 `pthread_exit()`
`pthread_creat()` 函数用于创建一个线程。该函数在 `pool_submit()` 函数中被使用，表示在有新的任务到来的时候将从线程池中挑出一个空闲的 tid 来创建一个新的线程来处理任务。这里提到的 tid 可以用 `pthread_t` 来创建，它会被用于接收新建线程的标识符。
```c
int pool_submit(void (*somefunction)(void *p), void *p)
{
    task worktodo;

    // add task to the queue
    worktodo.function = somefunction;
    worktodo.data = p;

    if (enqueue(worktodo))
    {
        printf("Pool Submit Failure.\n");
        return 1;
    }
    sem_wait(&thread_sem);
    for (int id = 0; id < NUMBER_OF_THREADS; id++)
        if (!thread_working[id])
        {
            thread_working[id] = 1;
            pthread_create(&thread_pool[id], NULL, &worker, (void *)&id);
            break;
        }

    return 0;
}
```

这段代码中使用了 `pthread_create(&thread_pool[id], NULL, &worker, (void *)&id)`。`&thread_pool[id]` 是指向 `pthread_t` 类型的数组中特定位置的指针，用于接收新线程的标识符。第二个参数 `NULL` 和 `pthread_mutex_init(&queue_mutex, NULL)` 中类似，表示使用默认属性创建线程。`&worker` 是一个函数指针，指向线程要执行的函数。`(void *)&id` 是传递给线程函数 `worker` 的参数。在这里，`id` 是一个整数值，通过将其地址转换为 `void *` 类型传递给线程函数。

在这里执行完 `pthread_create()` 之后，`worker()` 函数就会开始工作。工作结束之后执行 `pthread_exit(0)`，这里的参数 `0` 表示该线程传递了 `NULL` 指针作为退出状态。同时在执行了 `pthread_exit()` 之后，该线程的标识符 `thread_pool[id]` (这里的 `id` 是 `pool_submit()` 中的那个) 一方面可以作为 `pthread_join()` 的参数，让主线程获取该线程的退出状态；另一方面，该线程标识符被重新标记为可用，也就是能再次作为 `pthread_creat()` 的参数，来接收新的线程。

### `pthread_mutex_lock()` 与 `pthread_mutex_unlock()`
在 `pool_submit()` 和 `worker()` 函数中调用了 `enqueue()` 和 `dequeue()` 函数，分别表示新任务被挂起放在等待队列中，和任务被从等待队列中取出执行。为了防止进队出队的过程中出现冲突，这里使用了 `pthread_mutex_t` 类型的变量 `queue_mutex` 来处理该临界区问题。
```c
int enqueue(task t)
{
    if ((queue_tail + 1) % (QUEUE_SIZE + 1) == queue_head)
    {
        printf("Enqueue Failure.\n");
        return 1;
    }
    else
    {
        pthread_mutex_lock(&queue_mutex);
        task_queue[queue_tail] = t;
        queue_tail = (queue_tail + 1) % (QUEUE_SIZE + 1);
        pthread_mutex_unlock(&queue_mutex);
        return 0;
    }
}
```

比如这段代码中，在操作 `queue_head` 和 `queue_tail` 的前后使用 `pthread_mutex_lock(&queue_mutex)` 和 `pthread_mutex_unlock(&queue_mutex)`，使得队列的队首和队尾不会被多个线程同时操作。


### `sem_t` 信号量
`sem_t` 虽然不是 Pthread API 中的变量类型，但是与线程之间的同步有关，因此这里放在一起说明。这里创建的是一个匿名的信号量，因此在 `pthread_mutex_init()` 中初始化的时候使用的是 `sem_init(&thread_sem, 0, NUMBER_OF_THREADS)`，其中第一个参数就是我们要初始化的信号量，第二个参数为 `0`，表示该信号量为匿名，第三个参数则表示信号量的初始值。

在使用的过程中，`sem_wait(&queue_mutex)` 表示该信号量对应资源被申请，`sem_post(&queue_mutex)` 表示该信号量对应资源被释放。