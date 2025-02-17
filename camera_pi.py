#pi camera to be used with web based GUI plate solver
import io
import time
import picamera
from fractions import Fraction
import threading
try:
    from greenlet import getcurrent as get_ident
except ImportError:
    try:
        from thread import get_ident
    except ImportError:
        from _thread import get_ident

class imageEvent(object):
    """An Event-like class that signals all active clients when a new frame is
    available.
    """
    def __init__(self):
        self.events = {}

    def wait(self):
        """Invoked from each client's thread to wait for the next frame."""
        ident = get_ident()
        if ident not in self.events:
            # this is a new client
            # add an entry for it in the self.events dict
            # each entry has two elements, a threading.Event() and a timestamp
            self.events[ident] = [threading.Event(), time.time()]
        return self.events[ident][0].wait()

    def set(self):
        """Invoked by the camera thread when a new frame is available."""
        now = time.time()
        remove = None
        for ident, event in self.events.items():
            if not event[0].isSet():
                # if this client's event is not set, then set it
                # also update the last set timestamp to now
                event[0].set()
                event[1] = now
            else:
                # if the client's event is already set, it means the client
                # did not process a previous frame
                # if the event stays set for more than 5 seconds, then assume
                # the client is gone and remove it
                if now - event[1] > 5:
                    remove = ident
        if remove:
            del self.events[remove]

    def clear(self):
        """Invoked from each client's thread after a frame was processed."""
        self.events[get_ident()][0].clear()

"""  my new py camera class
    does not derive from a base class
    needs init to start frame thread
    needs __del__ method to kill that thread  maybe in a close function

    Don't think any static methods are needed.

    thread camera gain init function and call in init 


"""

class skyCamera():
    camera = None
    event = imageEvent()
    thread = None  # background thread that reads frames from camera
    gainThread = None
    frame = None  # current frame is stored here by background thread
    shutter = 1000000
    ISO=800
    resolution= (2000,1500)
    abortMode = False
    runMode = True
    cameraStopped = True
    format = 'jpeg'
    def __init__(self, shutter=1000000, ISO=800, resolution=(2000,1500), format = 'jpeg'):
        self.camera = picamera.PiCamera()
        self.camera.resolution = (2000,1500)
        self.camera.framerate = Fraction(1,6)
        self.shutter=shutter
        self.ISO=ISO
        self.resolution=resolution
        self.format = format
        self.setupGain()
        self.thread = threading.Thread(target=self._thread)
        self.thread.start()



    def __del__(self):
        if self.camera:
            self.camera.close()
            
    def pause(self):
        self.runMode = False

    def resume(self):
        self.runMode = True

    def setISO(self, iso):
        self.ISO = iso
        self.setupGain()

    def status(self):
        return [self.ISO, self.camera.shutter_speed, self.resolution]

    def setResolution(self,  size):
        self.resolution = size
        self.runMode = False
        print ("waiting for camera to stop to set resolution")
        while not self.cameraStopped:
            time.sleep(.2)
        res = tuple(map(int, size.split('x')))
        print ("setting resolution", res, self.camera.resolution)
        self.camera.resolution = res
        self.runMode = True

    def setFormat(self,type):
        self.format = type
        self.runMode = False
        while not self.cameraStopped:
            time.sleep(.2)
        self.runMode = True
    def setShutter(self, value):
        self.camera.shutter_speed = value
        print ("new shutter speed", value)

    def setupGain(self):
        #make sure previous instance gain thread is not already running
        if self.gainThread:
            self.gainThread.join()
        self.gainThread = threading.Thread(target=self.setGainThread)
        self.gainThread.start()

    def setGainThread(self):
        if self.camera:
            self.runMode = False
  
        print ("setup called")
        selfrunMode = False
        while not self.cameraStopped:
            pass
        print ("cammer has stopped", self.resolution)

        self.camera.resolution = self.resolution
        print ('camera framesize at init', self.resolution)
        self.camera.iso = self.ISO
        self.camera.exposure_mode = 'auto'
        self.camera.framerate = Fraction(1,6)

        self.camera.shutter_speed = self.shutter
        time.sleep(10)
        self.camera.exposure_mode = 'off'
        self.runMode = True
        self.abortMOde = False

    def get_frame(self):
        """Return the current camera frame."""
        # wait for a signal from the camera thread
        self.event.wait()
        self.event.clear()
        return self.frame

    # the thread that gets images
    def _thread(self):
        """Camera background thread."""
        while not self.runMode:
            time.sleep(.5)
        print('Starting camera thread.')

        frames_iterator = self.getImage()
        for frame in frames_iterator:
            self.frame = frame
            self.event.set()  # send signal to clients
            time.sleep(0)
        self.thread = None

    def getImage(self):
        print ("frames called")
        stream = io.BytesIO()
        print ("abortMOde", self.abortMode)
        while not self.abortMode:
            print ("not abortMode", self.runMode)
            while not self.runMode:
                if self.abortMode:
                    break
                pass
            if self.abortMode:
                break
            print ("camera started")
            for _ in self.camera.capture_continuous(stream, self.format,
                                                    use_video_port=False):


                # return current frame
                stream.seek(0)
                yield stream.read()
                if not self.runMode:
                    self.cameraStopped = True
                    print ("camera stopped")
                    break
                self.cameraStopped = False

                # reset stream for next frame
                stream.seek(0)
                stream.truncate()
