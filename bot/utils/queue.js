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

    append(e) {
        let node = new Node(e);
        this.tail.next = node;
        this.tail = this.tail.next;
        this.size++;
    }

    push(e) {
        console.log('added the song to the front');
        let node = new Node(e);
        node.next = this.head.next;
        this.head.next = node;
        this.size++;
    }

    remove(idx) {
        let cur = this.head;
        while (idx != 1 && cur.next != null) {
            cur = cur.next;
            idx--;
        }
        if (cur.next == null) {
            return false;
        }
        let res = cur.next
        cur = cur.next.next;
        this.size--;
        return res;
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
            let temp = this.pop();
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
