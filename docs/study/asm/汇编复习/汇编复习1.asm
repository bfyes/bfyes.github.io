
4. 补充知识点
(1) loop
mov ax, 0
mov cx, 3
again:
add ax, cx ; ax = 0 + 3 + 2 + 1
loop again ; 当cpu执行此指令时会做以下操作:
           ; ①sub cx, 1
           ; ②jnz again
当cx的初始值=0时，loop的循环次数是10000h次，并非0次

(2) jcxz, jecxz
mov ax, 0
mov cx, 0
jcxz done ; jump if cx is zero
again:
add ax, cx 
loop again
done:

(3) xlat
data segment
t db "0123456789ABCDEF"
data ends
code segment
assume cs:code, ds:data
main:
   mov ax, data
   mov ds, ax
   mov bx, offset t ; ds:bx->t
   mov al, 10 ; al是t中某个元素的下标
   xlat ; CPU在执行此指令时做以下操作:
        ; al = ds:[bx+al]
        ; al = 'A'
   mov ah, 4Ch
   int 21h
code ends
end main

(4) neg 与 not
mov ax, 2
neg ax ; ax = -2 = 0FFFEh
       ; neg ax相当于C语言的-ax

mov ah, 1 ;             0000 0001
not ah    ; ah = 0FEh = 1111 1110B
          ; not ah相当于C语言中的~ah

neg ax = (not ax) + 1 恒成立, 用C语言描述就是 -ax = ~ax + 1

(5) test 和 and
mov ah, 81h
test ah, 1   ; 计算ah & 1, 结果被丢弃而并不保存到ah中,
             ; 会影响标志位如ZF的状态, ZF=0
jnz lsb_is_1 ; 会跳转


mov ah, 81h
and ah, 1    ; 计算ah & 1, 结果会保存到ah中, ah=01h, 
             ; 同时会影响标志位如ZF的状态, ZF=0
jnz lsb_is_1 ; 会跳转

(6) lea 用来取某个变量的偏移地址(load effective address)
mov si, 1000h
mov bx, 230h
lea di, ds:[bx+si+4] ; di = bx+si+4 = 1234h

(7) adc 和 sbb
用16位寄存器计算18000h + 28001h, 结果保存到dx、ax中
mov ax, 8000h
mov dx, 1
add ax, 8001h ; ax=1, CF=1
adc dx, 2 ; dx = 1 + 2 + CF = 4
          ; adc表示带进位加(add with carry)
          
用16位寄存器计算38000h - 18001h, 结果保存到dx、ax中
mov ax, 8000h
mov dx, 3
sub ax, 8001h ; ax=0FFFFh, CF=1
sbb dx, 1 ; dx = 3 - 1 - CF = 1
          ; sbb表示带减位减(subtract with borrow)

(8) sal 和 sar
sal 是算术左移(shift arithmetic left), 等价于逻辑左移 shl
sar 是算术右移(shift arithmetic right) ≠ 逻辑右移 shr
mov ah, 0FEh ; ah=1111 1110B = -2
sar ah, 1    ; ah=1111 1111B = 0FFh = -1
mov ah, 4    ; ah=0000 0100B = 4
sar ah, 1    ; ah=0000 0010B = 2
sar是针对符号数的右移运算
shr是针对非符号数的右移运算
char a = 0xFE;
unsigned char b = 0xFE;
a >>= 1; // a = 0xFF = -1
b >>= 1; // b = 0x7F = 127

(9) rcl 和 rcr
rcl 是带进位循环左移(rotate through carry left)
rcr 是带进位循环右移(rotate through carry right)

mov ah, 10110110B
stc ; CF=1  CF AH           CF AH
rcl ah, 1 ; 1  10110110     1  01101101 
          ; 移位前          移位后


mov ah, 10110110B
clc ; CF=0  CF AH           CF AH
rcl ah, 1 ; 0  10110110     0  01011011 
          ; 移位前          移位后
                                          不作要求
(10) 标志位: CF、ZF、SF、OF、IF、DF、TF、(AF、  PF)
CF进位标志, 相关指令: clc, stc, jc, jnc, jb, ja
ZF零标志, 相关指令: jz≡je, jnz≡jne
IF中断标志, 相关指令: cli, sti
TF陷阱标志
SF符号标志, 相关指令: js, jns, jl, jg, jle, jge
   运算结果的最高位会自动复制到SF中
   mov ah, 0 ; 
   sub ah, 2 ; ah=0FEh=1111 1110, SF=1
   js result_is_negative ; 当SF=1时则跳, 故条件满足并跳转
   
      
OF溢出标志, 相关指令: jo, jno, jl, jg, jle, jge
   当两个正数相加变成负数，或者两个负数相加变成正数时, OF=1
   mov ah, 7Fh; ah=127
   add ah, 1  ; ah=80h=-128, OF=1
   jo overflow; 当OF=1时则跳转，故条件满足并跳转
   
   mov ah, 80h  ; ah=-128
   add ah, 0FFh ; ah=7Fh=+127, OF=1, CF=1
   jo overflow  ; 会跳转
   
jl(符号数比较若小于则跳)的条件: SF ≠ OF
mov ah, 1
mov bh, 2
cmp ah, bh ; SF=1, OF=0 ==> ah < bh
jl ah_is_less_than_bh ; 会跳转

mov ah, 80h ; -128
mov bh, 7Fh ; +127
cmp ah, bh  ; SF=0, OF=1 ==> ah < bh
jl ah_is_less_than_bh ; 会跳转

设SF=1, OF=0, ZF=1 或  SF=0, OF=1, ZF=1
jl less ; 仍旧会跳转
        ; 因为jl跳转跟ZF无关


jb(非符号数比较若小于则跳转)的条件: CF=1
jb ≡ jc
mov ah, 7Fh ; ah=127
mov bh, 80h ; bh=128
cmp ah, bh  ; CF=1
jb ah_is_below_bh ; 当CF=1时则跳, 条件满足

DF方向标志(direction flag), 相关指令: cld, std
cld使DF=0, 表示字符串操作方向为正方向
std使DF=1, 表示字符串操作方向为反方向

(11) cbw, cwd, cdq, movsx, movzx
mov al, 7Fh
cbw ; 把al符号扩充到ax中, ax=007Fh
    ; cbw: convert byte to word
mov al, 0FEh
cbw ; 把al符号扩充到ax中, ax=0FFFEh
    ; cbw: convert byte to word
mov ax, 8000h
cwd ; 把ax符号扩充到dx、ax中
    ; dx=0FFFFh, ax=8000h
    ; cwd: convert word to double word
mov eax, 98765432h
cdq ; 把eax符号扩充到edx、eax中
    ; edx=0FFFFFFFFh, eax=98765432h
    ; cdq: convert double word to quadruple word

mov al, 80h   ; 
movzx bx, al  ; bx = 0080h; 80h --> 0080h
movzx ecx, al ; ecx = 00000080h; 80h --> 00000080h

mov ax, 8000h
movzx eax, ax ; eax=00008000h
              ; movzx: move by zero extension 非符号数扩充
mov ax, 8000h
movsx ebx, ax ; ebx=0FFFF8000h
              ; movsx: move by sign extension 符号数扩充
              
(12) jmp指令
jmp有3类：短跳、近跳、远跳
①短跳
 地址     机器码 汇编指令  ; EB表示近跳, 06表示跳转距离
1000:2000 EB 06  jmp 2008h ; 2008h    -   2002h  = 06h
1000:2002 ...              ; 目标地址    下条指令的偏移地址
1000:2008 B4 4C  mov ah, 4Ch
1000:200A CD 21  int 21h


1000:1FF0 B4 4C mov ah, 4Ch
1000:1FF2 CD 21 int 21h
...
1000:2000 EB EE jmp 1FF0h ; 1FF0h - 2002h = 0FFEEh
1000:2002 ...

②近跳
 地址     机器码 汇编指令    ; E9表示近跳, FE 0F表示小端格式的跳转距离
1000:2000 E9 FD 0F jmp 3000h ; 3000h    -   2003h  = 0FFDh
1000:2003 ...                ; 目标地址    下条指令的偏移地址
...
1000:3000 B4 4C  mov ah, 4Ch
1000:3002 CD 21  int 21h

③远跳
 地址     机器码 汇编指令; EA表示远跳
                         ; jmp 2000h:3000h
1000:2000 EA 00 30 00 20 ; 00 30 00 20表示小端格式的
1000:2005 ...            ; 目标地址2000:3000
...
2000:3000 B4 4C  mov ah, 4Ch
2000:3002 CD 21  int 21h

(13) 字符串指令
   rep movsb    ; memcpy(char *t, char *s, int n)
   repne scasb  ; strlen()
   lodsb
   stosb

例1:
data segment
s db "Hello", 0      
t db 100 dup('T')
data ends

code segment
assume cs:code, ds:data
main:
   mov ax, data
   mov ds, ax   
;   mov si, offset s
;   mov cx, 0
;again:   
;   mov al, [si]
;   inc si
;   inc cx
;   cmp al, 0
;   jne again   
;done:       ; cx=6   
   mov es, ax
   cld ; DF=0
   mov di, offset s ; es:di -> s
   mov cx, 0FFFFh
   mov al, 0   ; al=需要在es:di指向的字符串中寻找的byte
next:   
   ;cmp cx, 0
   ;je repne_scasb_done
   ;cmp al, es:[di]
   ;pushf
   ;inc di
   ;dec cx
   ;popf
   ;jne next
 ;repne_scasb_done:  
   repne scasb ; 若本次扫描不等则继续扫描
             ; 扫描一次是指把al与byte ptr es:[di]做比较,再di++
             ; 扫描多次是指把al与byte ptr es:[di]做比较,
             ; 再di++, cx--, 其中cx是循环次数, 当cx变0或者
             ; al==byte ptr es:[di]时结束循环
over:   
   not cx ; not cx = FFFF - cx
          ; cx=s中字符串的长度(含末尾的0)=6
   mov si, offset s
   mov di, offset t

again:
;   cmp cx, 0
;   je rep_movsb_done
;   mov al, ds:[si]
;   mov es:[di], al
;   inc si
;   inc di
;   dec cx
;   jmp again
;rep_movsb_done:   
   rep movsb; 重复做以下操作直到cx==0:
            ;    byte ptr es:[di]=byte ptr ds:[si],
            ;    si++, di++, cx--
done:            
   mov ah, 4Ch
   int 21h
code ends
end main

例2:
data segment
s db "###A#B#C#"
t db 100 dup(0)
data ends

code segment
assume cs:code, ds:data
main:
   mov ax, data
   mov ds, ax
   mov es, ax
   cld ; DF=0
   mov si, offset s
   mov di, offset t
   mov cx, offset t - offset s
again:   
   lodsb ; al = ds:[si], si++
   cmp al, '#'
   je skip
   stosb ; es:[di]=al, di++
skip:   
   loop again
   mov ah, 4Ch
   int 21h
code ends
end main

   
当用cld指令使DF=0时, 字符串指令如movsb、scasb、lodsb、stosb
都对si、di做递增

当用std指令使DF=1时, 字符串指令如movsb、scasb、lodsb、stosb
都对si、di做递减

在调试repne scasb及rep movsb指令时，要按F7(trace into)

