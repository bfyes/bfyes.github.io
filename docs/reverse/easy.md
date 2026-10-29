# easy reversing

```c linenums="1"
puts("Please input flag: ");
scanf("%16s", &v12);
if (v25)
    puts("Your flag is not right!");
v3 = 0;
v13 ^= v16; v4 = v16 ^ v13; v13 = v16; v16 = v4;  // v13 <-> v16
v14 ^= v19; v5 = v19 ^ v14; v14 = v19; v19 = v5;  // v14 <-> v19
v15 ^= v22; v6 = v22 ^ v15; v15 = v22; v22 = v6;  // v15 <-> v22
v17 ^= v20; v7 = v20 ^ v17; v17 = v20; v20 = v7;  // v17 <-> v20
v18 ^= v23; v23 ^= v18; v18 ^= v23;               // v18 <-> v23
v21 ^= v24; v8 = v24 ^ v21; v21 = v24; v24 = v8;  // v21 <-> v24
do {
    v10 = *(&v12 + v3);
    if ((unsigned __int8)(v10 - 65) <= 0x19u) {
        v9 = v3 + v10;
        if ((unsigned __int8)v9 > 0x5Au)
            goto LABEL_5;
        goto LABEL_6;
    }
    if ((unsigned __int8)(v10 - 97) <= 0x19u) {
        v9 = v3 + v10;
        if ((unsigned __int8)v9 > 0x7Au)
LABEL_5:
            v9 -= 26;
LABEL_6:
        *(&v12 + v3) = v9;
    }
    ++v3;
} while (v3 != 16);
if (!strcmp("AskdEjyzIe_j{_s}", &v12))
    puts("Yes, you are right!");
```

```pyodide
target = "AskdEjyzIe_j{_s}"
buf = []
for i in range(len(target)):
    c = target[i]
    if c.isupper():
        buf.append(chr((ord(c) - ord("A") - i) % 26 + ord("A")))
    elif c.islower():
        buf.append(chr((ord(c) - ord("a") - i) % 26 + ord("a")))
    else:
        buf.append(c)
for a, b in [(1, 4), (2, 8), (3, 12), (6, 9), (7, 13), (11, 14)]:
    buf[a], buf[b] = buf[b], buf[a]
print("".join(buf))
```

