.global _start
_start:
	
	MOV r3, #0
	LDR r4, =len
	LDR r4, [r4]
	SUB r4, r4,#1
	LDR r5,=str
	
loop:
	CMP r3,r4
	BGE exit
	LDRB r6,[r5,r3]
	LDRB r7,[r5,r4]
	STRB r6,[r5,r4]
	STRB r7,[r5,r3]
	ADD r3,r3,#1
	SUB r4, r4,#1
	B loop
	
exit:
	


.data
str: .ascii "Hello World"
len= . -str
	