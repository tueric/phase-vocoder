function tsig = transformsignal(x, fs, f0_est, ranges, correct_notes)
  notes = getnotes();
  tsig = x;
  ranges
  correct_notes
  for i = 1:size(ranges)(1)
    l = ranges(i,1) * fs;
    r = ranges(i,2) * fs;
    desired_freq = getfield(notes, correct_notes{1, i});
    avg_freq = mean(f0_est(l:r));
    frac = desired_freq / avg_freq;
    corrected = correctsingle(x(l:r), frac, 0.0000001);
  endfor
endfunction



