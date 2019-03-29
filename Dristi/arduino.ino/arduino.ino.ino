#include <Servo.h>


int RED_PIN= 11;
int GREEN_PIN= 12;


Servo LOCK_SERVO;
Servo DOOR_SERVO;

volatile int CTRL=2;

void setup() {

//pinMode(ALARM, OUTPUT);
pinMode(CTRL,INPUT);

pinMode(RED_PIN, OUTPUT);
 digitalWrite(RED_PIN,HIGH);
pinMode(GREEN_PIN, OUTPUT);
 digitalWrite(GREEN_PIN, LOW);

LOCK_SERVO.attach (9);
DOOR_SERVO.attach (10);
DOOR_SERVO.write(0);
   LOCK_SERVO.write(90);
attachInterrupt(0, DOOR, CHANGE);
}

void loop() {

}

void DOOR(){
  
  if(digitalRead(CTRL)== HIGH)
  {
  
   digitalWrite(GREEN_PIN, HIGH);
    digitalWrite(RED_PIN, LOW);
 LOCK_SERVO.write(0);
   DOOR_SERVO.write(40);
   /*if(digitalRead(A)== HIGH&& (digitalRead(B)== HIGH)&& (digitalRead (C)== LOW)&&(digitalRead (D)== HIGH))
   {
   digitalWrite(RED_PIN, LOW);
   digitalWrite(GREEN_PIN, HIGH);
  
   digitalWrite(A, LOW);
   digitalWrite(B, LOW);
   digitalWrite(C, LOW);
   digitalWrite(D, LOW);
   }
   else{
    digitalWrite(ALARM, HIGH);
   }*/
  }
  if(digitalRead(CTRL)== LOW)
  {
   DOOR_SERVO.write(0);
   LOCK_SERVO.write(90);
   digitalWrite(GREEN_PIN, LOW);
   digitalWrite(RED_PIN, HIGH);
  
  }
}
