# File test cố tình vi phạm quy chuẩn RuboCop

class TestComplexity
  # Lỗi: Quá nhiều tham số (> 4) và Cyclomatic Complexity cao
  def complex_method(arg1, arg2, arg3, arg4, arg5, arg6)
    if arg1 > 0
      if arg2 > 0
        if arg3 > 0
          if arg4 > 0
            puts "Lồng lặp quá sâu!"
          end
        end
      end
    end

    case arg5
    when 1 then puts "One"
    when 2 then puts "Two"
    when 3 then puts "Three"
    when 4 then puts "Four"
    else puts "Other"
    end
  end
end