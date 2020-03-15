class Queue {
    constructor() {
        this.head = new Node(-1);
        this.tail = this.head;
        this.size = 0;
    }

    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.head.next.value;
    }

    pop() {
        if (this.isEmpty()) {
            return null;
        }
        let res = this.head.next;
        if (res == this.tail) {
            this.tail = this.head;
        }
        this.head.next = this.head.next.next;
        this.size--;
        return res.value;
    }

    /**
     * append the element to the end of the queue
     * @param {*} e 
     */
    append(e) {
        let node = new Node(e);
        this.tail.next = node;
        this.tail = this.tail.next;
        this.size++;
    }

    /**
     * append the given element to the head of the queue
     * @param {*} e 
     */
    push(e) {
        let node = new Node(e);
        node.next = this.head.next;
        this.head.next = node;
        this.size++;
    }

    remove(idx=1) {
        let cur = this.head;
        while (idx != 1 && cur.next != null) {
            cur = cur.next;
            idx--;
        }
        if (cur.next == null) {
            return null;
        }
        let res = cur.next
        if (res == this.tail) {
            this.tail = cur;
        }
        cur.next = cur.next.next;
        this.size--;
        console.log(res.value);
        return res.value;
    }

    removeAll() {
        this.head.next = null;
        this.tail = this.head;
    }

    moveToTop(idx) {
        let res = remove(idx);
        if (!res) {
            return false;
        }
        this.push(res);
    }

    shift(times=1) {
        while (times != 0) {
            let temp = this.remove();
            this.append(temp);
            times--;
        }
    }

    toList() {
        let res = [];
        let cur = this.head.next;
        while (cur != null) {
            res.push(cur.value);
            cur = cur.next;
        }
        return res;
    }

    isEmpty() {
        return this.head.next == null;
    }
}

class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

exports.Queue = Queue;
