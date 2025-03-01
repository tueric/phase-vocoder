function tsig = transformsignal(filename, ranges, correct_notes)
  [x, fs] = audioread(filename);
  notes = getnotes();
  pitch = getpitch(x);
  tsig = x;
  for i = 1:size(ranges)(1)
    l = ranges(i,1) * fs;
    r = ranges(i,2) * fs;
    desired_freq = getfield(notes, correct_notes(i, :));
    avg_freq = mean(pitch(l:r));
    frac = desired_freq / avg_freq;
    tsig(l:r) = correctsingle(x(l:r), frac, 0.000000000001);
  endfor
endfunction


