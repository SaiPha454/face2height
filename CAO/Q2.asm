.global _start

.section .data
result_message: .asciz "Decimal result: "

.section .bss
buffer:  .skip 16         
.section .text
_start:
    @ Hard-code the value in R0 (for demonstration)
    MOV R0, #0xC          @ R0 = 0xC (decimal 12) Change the value as you want

   
    ldr r1, =buffer       
    bl hex_to_decimal_string

    @ Print the decimal result
    ldr r0, =result_message 
    bl print_string

    @ Exit the program
    mov r7, #1            
    swi 0

print_string:
    
    mov r1, r0             
    mov r0, #1             
    mov r2, #255           
    mov r7, #4             
    swi 0
    bx lr

hex_to_decimal_string:
    PUSH {LR}              
    MOV R2, R1             
    MOV R3, #10           

    MOV R4, R0
    MOV R5, #0             

calculate_length:
    CMP R4, #0
    BEQ done_length
    ADD R5, R5, #1
    UDIV R4, R4, R3
    B calculate_length

done_length:
    CMP R5, #0
    BEQ handle_zero
    ADD R2, R2, R5         
    MOV R4, #0             
    STRB R4, [R2]
    SUB R2, R2, #1         

convert_to_string:
    CMP R5, #0
    BEQ end_conversion
    MOV R4, R0
    UDIV R0, R0, R3        
    MLS R4, R0, R3, R4     
    ADD R4, R4, #'0'       
    STRB R4, [R2]          
    SUB R2, R2, #1         
    SUB R5, R5, #1         
    B convert_to_string

handle_zero:
    MOV R5, #1
    ADD R2, R2, R5         
    MOV R4, #'0'
    STRB R4, [R2]          

end_conversion:
    POP {LR}               
    BX LR                  
