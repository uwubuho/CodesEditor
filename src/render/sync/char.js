class Identifier {
    constructor(digit, site) {
        this.digit = digit;
        this.site = site;
    }

    toString() {
        return "(" + this.digit + ", " + this.site + ")"
    }

    static toString(identifier) {
        return "(" + identifier.digit + ", " + identifier.site + ")"
    }

    static compare(i1, i2) {
        if (i1.digit < i2.digit) {
            return -1;
        } else if (i1.digit > i2.digit) {
            return 1;
        } else {
            if (i1.site < i2.site) {
                return -1;
            } else if (i1.site > i2.site) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}

class Char {

    constructor(identifiers, timestamp, value) {
        this.position = identifiers;
        this.timestamp = timestamp;
        this.value = value;
    }

    static getPos(char) {
        var str = "[ "
        char.position.forEach((pos) => {
            str += Identifier.toString(pos) + ", ";
        })
        var str = str.substring(0, str.length - 2);
        str += " ]"
        return str;
    }

    static comparePosition(pos1, pos2) {
        for (let i = 0; i < Math.min(pos1.length, pos2.length); i++) {
            const comp = Identifier.compare(pos1[i], pos2[i]);
            if (comp !== 0) {
                return comp;
            }
        }
        if (pos1.length < pos2.length) {
            return - 1;
        } else if (pos1.length > pos2.length) {
            return 1;
        } else {
            return 0;
        }
    }
}

class CharNode {
    constructor(char, parent = null) {
        this.parent = parent;
        this.char = char;
        this.left = null;
        this.right = null;
        this.size = 1;

        if (parent) {
            this.parent.addSize();
        }
    }

    addSize() {
        this.size++;
        if (this.parent) this.parent.addSize();
    }

    subSize() {
        this.size--;
        if (this.parent) this.parent.subSize();
    }

    static insert(char, root) {
        if (root) {
            var comp = Char.comparePosition(char.position, root.char.position);
            if (comp > 0) {
                if (root.right) return CharNode.insert(char, root.right)
                else return root.right = new CharNode(char, root);
            }
            else if (comp < 0) {
                if (root.left) return CharNode.insert(char, root.left)
                else return root.left = new CharNode(char, root);
            }
            else {
                throw "El nodo ya existe";
            }
        }
        else {
            return new CharNode(char);
        }
    }

    static find(pos, root) {
        var comp = Char.comparePosition(pos, root.char.position);
        if (comp > 0) {
            if (root.right) return CharNode.find(pos, root.right)
            else throw "El nodo no existe";
        }
        else if (comp < 0) {
            if (root.left) return CharNode.find(pos, root.left)
            else throw "El nodo no existe";
        }
        else {
            return root;
        }
    }

    static delete(node) {
        if (node.right && node.left) {
            var sucesor = node.right;
            while (sucesor.left) {
                sucesor = sucesor.left;
            }
            node.char = sucesor.char;
            CharNode.delete(sucesor);
            return node;
        }
        else if (node.right)
            return CharNode.replaceSelfInParent(node, node.right)
        else if (node.left)
            return CharNode.replaceSelfInParent(node, node.left)
        else
            return CharNode.replaceSelfInParent(node, null)
    }

    static replaceSelfInParent(node, value) {
        if (value) value.parent = node.parent;
        if (node.parent) {
            node.parent.subSize();
            if (node.parent.right === node)
                node.parent.right = value;
            else
                node.parent.left = value;
        }
        else {
            node = value;
        }
        return node;
    }

    static indexFromNode(node) {
        var size = node.left ? node.left.size : 0;
        var n = node;
        while (n.parent) {
            if (n.parent.right && n.parent.right === n) {
                var plusSize = n.parent.left ? n.parent.left.size : 0;
                plusSize++;
                size += plusSize;
            }
            n = n.parent;
        }
        return size;
    }

    static nodeFromIndex(index, root) {
        if (!root) return null;
        if (index < 0) return null;
        var leftSize = root.left ? root.left.size : 0;
        if (index === leftSize) {
            return root;
        }
        else if (index < leftSize) {
            return CharNode.nodeFromIndex(index, root.left);
        }
        else {
            if (root.right) {
                return CharNode.nodeFromIndex(index - leftSize - 1, root.right)
            }
            else {
                return null;
            }
        }
    }

    static generarPos(before, after, site) {
        var headBefore, headAfter;
        var dir;
        if (!before[0] && !after[0]) {
            headBefore = new Identifier(0, site);
            headAfter = new Identifier(Number.POSITIVE_INFINITY, site);
            dir = 1;
        }
        else if (!before[0]) {
            headBefore = new Identifier(Number.NEGATIVE_INFINITY, site);
            headAfter = after[0];
            dir = -1;
        }
        else if (!after[0]) {
            headBefore = before[0];
            headAfter = new Identifier(Number.POSITIVE_INFINITY, site);
            dir = 1;
        }
        else {
            headBefore = before[0];
            headAfter = after[0];
            dir = 1;
        }

        if (headBefore.digit !== headAfter.digit) {
            if (dir === 1) {
                if (headBefore.digit + 1 < headAfter.digit) {
                    return [new Identifier(headBefore.digit + 1, site)]
                }
                else {
                    var [, ...lastBefore] = before;
                    return [headBefore].concat(CharNode.generarPos(lastBefore, [], site))
                }
            }
            else {
                if (headAfter.digit - 1 > headBefore.digit) {
                    return [new Identifier(headAfter.digit - 1, site)]
                }
                else {
                    var [, ...lastAfter] = after;
                    return [headAfter].concat(CharNode.generarPos(lastAfter, [], site))
                }
            }
        }
        else {
            if (headBefore.site < headAfter.site) {
                var [, ...lastBefore] = before;
                return [headBefore].concat(CharNode.generarPos(lastBefore, [], site));
            }
            else if (headBefore.site === headAfter.site) {
                var [, ...lastBefore] = before;
                var [, ...lastAfter] = after;
                return [headBefore].concat(CharNode.generarPos(lastBefore, lastAfter, site))
            }
            else {
                throw new Error("invalid site ordering");
            }
        }
    }
}

export { Char, Identifier, CharNode };