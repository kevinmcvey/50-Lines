#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <wiringPi.h>
#include <linux/input.h>
#include <linux/uinput.h>

#define INPUT_LOCATION "/dev/uinput"
#define INPUT_NAME "GPIOKeyboard"

#define KEY_PRESSED 1
#define KEY_RELEASED 0

#define EVENT_SPACE_SLEEP_USECONDS 15000
#define KEYBOARD_SETUP_SLEEP_SECONDS 1

struct GpioKey {
    int pin;
    int key;
};

int GPIO_KEYS_COUNT = 11;
struct GpioKey GPIO_KEYS[] = {
	{  0, KEY_H },
	{  1, KEY_V },
	{  2, KEY_F },
	{  3, KEY_B },
	{  4, KEY_N },
	{  5, KEY_COMMA },
	{  6, KEY_LEFT },
	{ 11, KEY_RIGHT }, /* 7 doesn't work */
	{  8, KEY_BACKSPACE },
	{  9, KEY_C },
	{ 10, KEY_P }
};

void die(char * message, short errorNumber) {
	fprintf(stderr, message);
	exit(errorNumber);
}

void ensureRootOrExit(void) {
	if (geteuid() != 0)
		die("Root access is required. Run with sudo.\n", 1);
}

void setupGpioOrExit(struct GpioKey * gpioKeys, int gpioKeysCount) {

	if (wiringPiSetup() == -1)
		die("WiringPi is required. Be sure to install from wiringpi.com\n", 2);

	int key = 0;
	for (key = 0; key < gpioKeysCount; key++) {
		pinMode(gpioKeys[key].pin, INPUT);
		pullUpDnControl(gpioKeys[key].pin, PUD_UP);
	}
}

// Returns the File Descriptor int
int setupKeyboardOrExit(struct GpioKey * gpioKeys, int gpioKeysCount) {
	
	int fileDescriptor;

	// Open the keyboard in write-only non-blocking mode
	fileDescriptor = open(INPUT_LOCATION, O_WRONLY | O_NONBLOCK);
	if (fileDescriptor < 0)
		die("Failed to open the input device\n", 3);

	sleep(KEYBOARD_SETUP_SLEEP_SECONDS);

	// Enable key presses
	if (ioctl(fileDescriptor, UI_SET_EVBIT, EV_KEY) < 0)
		die("Failed to enable key presses\n", 4);

	// Enable key releases
	if (ioctl(fileDescriptor, UI_SET_EVBIT, EV_REL) < 0)
		die("Failed to enable key releases\n", 5);


    // Eanble the keys individually
	int key = 0;
    for (key = 0; key < gpioKeysCount; key++) {
		if (ioctl(fileDescriptor, UI_SET_KEYBIT, gpioKeys[key].key) < 0)
			die("Failed to enable key\n", 6);
	}

	// Create a uinput object
	struct uinput_user_dev uinputDev;
	memset(&uinputDev, 0, sizeof(uinputDev));
	snprintf(uinputDev.name, UINPUT_MAX_NAME_SIZE, INPUT_NAME);
	uinputDev.id.bustype = BUS_USB;
	uinputDev.id.vendor = 0x1;
	uinputDev.id.product = 0x1;
	uinputDev.id.version = 1;

	// Write the uinput object to the File Descriptor
	if (write(fileDescriptor, &uinputDev, sizeof(uinputDev)) < 0)
		die("Failed to write uinput object to File Descriptor\n", 7);

	// Request the creation of the emulated keyboard
	if (ioctl(fileDescriptor, UI_DEV_CREATE) < 0)
		die("Failed to successfully create emulated keyboard\n", 8);

	sleep(KEYBOARD_SETUP_SLEEP_SECONDS);

	return fileDescriptor;
}

int performInputEvent(int fileDescriptor, unsigned char type, int code, unsigned char value) {

	struct input_event inputEvent;

	memset(&inputEvent, 0, sizeof(struct input_event));
	inputEvent.type = type;
	inputEvent.code = code;
	inputEvent.value = value;

	return write(fileDescriptor, &inputEvent, sizeof(struct input_event));
}

void emulateKeypress(int fileDescriptor, int key) {

	if (performInputEvent(fileDescriptor, EV_KEY, key, KEY_PRESSED) < 0)
		die("Failed to register key state change to pressed\n", 9);

	if (performInputEvent(fileDescriptor, EV_SYN, 0, 0) < 0)
		die("Failed to register event space\n", 10);

	usleep(EVENT_SPACE_SLEEP_USECONDS);

	if (performInputEvent(fileDescriptor, EV_KEY, key, KEY_RELEASED) < 0)
		die("Failed to register key state change to released\n", 11);

	if (performInputEvent(fileDescriptor, EV_SYN, 0, 0) < 0)
		die("Failed to register event space\n", 10);

	usleep(EVENT_SPACE_SLEEP_USECONDS);
}

// Returns the uinput KEY int
int pollGpioAndGetKey(struct GpioKey * gpioKeys, int gpioKeysCount) {
	
	int key = 0;

	for (key = 0; key < gpioKeysCount; key++) {
		if (digitalRead(gpioKeys[key].pin) == LOW) {
			while (digitalRead(gpioKeys[key].pin) == LOW); // Hold state -- debounce

			return gpioKeys[key].key;
		}
	}

	return -1;
}

int main(void) {

	ensureRootOrExit();
	setupGpioOrExit(GPIO_KEYS, GPIO_KEYS_COUNT);
	int fileDescriptor = setupKeyboardOrExit(GPIO_KEYS, GPIO_KEYS_COUNT);

    printf("GPIOKeyboard initialized successfully. Now listening...\n");

	while (1 == 1) {
		int key = pollGpioAndGetKey(GPIO_KEYS, GPIO_KEYS_COUNT);

		if (key != -1) {
			emulateKeypress(fileDescriptor, key);
		}
	}
}
