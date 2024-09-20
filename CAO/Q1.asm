.global _start

.section .data
prompt:  .asciz "Enter a positive decimal number: "
newline: .asciz "\n"

.section .bss
input:   .skip 16        

.section .text
_start:
    
    ldr r0, =prompt
    bl print_string
   
    
    ldr r0, =input
    bl read_input
   
    
    ldr r0, =input
    bl ascii_to_int
   
    
    @ Exit the program
    mov r7, #1             
    swi 0

print_string:
    @ Print the string pointed by r0
    mov r1, r0             
    mov r0, #1             
    mov r2, #255           
    mov r7, #4             
    swi 0
    bx lr

read_input:
    
    mov r1, r0             
    mov r0, #0             
    mov r2, #16            
    mov r7, #3             
    swi 0
    
    subs r2, r2, #1        
    ldrb r3, [r1, r2]      
    cmp r3, #10            
    beq read_input_done
    mov r3, #0             
    strb r3, [r1, r2]
read_input_done:
    bx lr

ascii_to_int:
    @ Convert ASCII string to integer
    mov r1, #0             
    mov r2, #0             
    mov r0, r0             

atoi_loop:
    ldrb r3, [r0], #1      
    cmp r3, #10            
    beq atoi_end
    sub r3, r3, #'0'       
    mov r2, r1, lsl #3     
    add r1, r2, r1, lsl #1 
    add r1, r1, r3         
    b atoi_loop

atoi_end:
    mov r0, r1          
    bx lr
